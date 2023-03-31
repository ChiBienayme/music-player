// Music player
/*
    1. Render songs
    2. Scroll too
    3. Play / pause /seek
    4. CD rotate
    5. Next / Prev
    6. Random
    7. Next / Repeat when ended
    8. Active song
    9. Scroll active song into view
    10. Play song when click
*/

// Some songs may be faulty due to broken links. Please replace another link so that it can be played

const $ = document.querySelector.bind(document);
const $$ = document.querySelectorAll.bind(document);

// constants => capitalization
const PLAYER_STORAGE_KEY = "F8_PLAYER";

const player = $('.player');
const cd = $('.cd');
const heading = $('header h2');
const cdThumb = $('.cd-thumb');
const audio = $('#audio');
const playBtn = $('.btn-toggle-play');

const progress = $('#progress');
const timeCurrent = $(".progress-time__current");
const timeDuration = $(".progress-time__duration");

const prevBtn = $('.btn-prev');
const nextBtn = $('.btn-next');
const randomBtn = $('.btn-random');
const repeatBtn = $('.btn-repeat');

const playlist = $('.playlist');


const app = {
    currentIndex: 0,
    isPlaying: false,
    isRandom: false,
    isRepeat: false,
    config: JSON.parse(localStorage.getItem(PLAYER_STORAGE_KEY)) || {},
    songs: [
        {
            name: "Valentine",
            singer: "Martina McBride",
            path: "./assets/music/Martina McBride – Valentine.mp3",
            image: "https://i.discogs.com/5C-_df1FfYQ93G0FWivQm4EETuAduXZjY32CFp-92Jw/rs:fit/g:sm/q:90/h:590/w:600/czM6Ly9kaXNjb2dz/LWRhdGFiYXNlLWlt/YWdlcy9SLTIxMDg2/MTczLTE2NDUyOTc3/MDYtMTc2OC5qcGVn.jpeg"
        },
        {
            name: "Hallelujah",
            singer: "Pentatonix",
            path: "./assets/music/Pentatonix – Hallelujah.mp3",
            image:
              "https://m.media-amazon.com/images/W/IMAGERENDERING_521856-T1/images/I/61XK6WAvjpL._UXNaN_FMjpg_QL85_.jpg"
          },
          {
            name: "You Are Not Alone",
            singer: "Michael Jackson",
            path: "./assets/music/Michael Jackson – You Are Not Alone.mp3",
            image: "https://upload.wikimedia.org/wikipedia/en/1/1e/You_Are_Not_Alone.jpg"
          },
          {
            name: "Right Here Waiting",
            singer: "Richard Marx",
            path: "./assets/music/Richard Marx – Right Here Waiting.mp3",
            image:
              "https://upload.wikimedia.org/wikipedia/en/2/2d/Right_here_waiting.jpg"
          },
          {
            name: "I Knew I Loved You",
            singer: "Savage Garden",
            path: "./assets/music/Savage Garden – I Knew I Loved You.mp3",
            image:
              "https://m.media-amazon.com/images/W/IMAGERENDERING_521856-T1/images/I/81QYOSO04AL._UF1000,1000_QL80_.jpg"
          },
          {
            name: "From This Moment",
            singer: "Shania Twain",
            path: "./assets/music/Shania Twain – From This Moment.mp3",
            image:
              "https://upload.wikimedia.org/wikipedia/en/a/aa/From_This_Moment_On_%28Shania_Twain_song%29.jpg"
          },
          {
            name: "Breathless",
            singer: "Shayne Ward",
            path: "./assets/music/Shayne Ward – Breathless.mp3",
            image:
              "https://upload.wikimedia.org/wikipedia/en/7/72/Shayne_Ward_Breathless.jpg"
          }
    ],
    setConfig: function(key, value) { 
        this.config[key] = value;
        localStorage.setItem(PLAYER_STORAGE_KEY, JSON.stringify(this.config));
    },
    render: function() {
        const htmls = this.songs.map((song, index) => {
          return `
              <div class="song ${index === this.currentIndex ? 'active' : ''}" data-index="${index}">
                <div
                    class="thumb"
                    style="
                        background-image: url('${song.image}');
                    "
                ></div>

                <div class="body">
                    <h3 class="title">${song.name}</h3>
                    <p class="author">${song.singer}</p>
                </div>

                <div class="option">
                    <i class="fas fa-ellipsis-h"></i>
                </div>
 
              </div>
          `
         })
         playlist.innerHTML = htmls.join('\n');
    },
    defineProperties: function() { 
        Object.defineProperty(this, 'currentSong', {
            get: function() {
              return this.songs[this.currentIndex];
            }
        })
    },
    handleEvents: function() {
        const _this = this; //app

        //width of image on CD
        const cdWidth = cd.offsetWidth;

        // Handle CD spins / stops
        const cdThumbAnimate = cdThumb.animate([
          { transform: "rotate(360deg)" }
        ], {
            duration: 10000, //10 seconds
            interations: Infinity
        })
        cdThumbAnimate.pause();

        //handle zooming
        document.onscroll = function() {
          //height of the window
          const scrollTop = window.scrollY || document.documentElement.scrollTop;

          //new width of CD is decreasing with a condition that width > 0
          const newCdWidth = cdWidth - scrollTop;
          cd.style.width = newCdWidth > 0 ? newCdWidth + 'px' : 0;
          cd.style.opacity = newCdWidth/cdWidth;
        }

        //handling when click play
        playBtn.onclick = function() {
            if(_this.isPlaying) {
                audio.pause();
            } else {
                audio.play();
            } 
        }

        // When a song is played
        audio.onplay = function() {
            _this.isPlaying = true;
            player.classList.add('playing');
            cdThumbAnimate.play();
        }

        // When a song is paused
        audio.onpause = function() {
            _this.isPlaying = false;
            player.classList.remove('playing');
            cdThumbAnimate.pause();

        }

        // when the song tempo changes
        audio.ontimeupdate = function() { 
          if (audio.duration) {
            const progressPercent = Math.floor(audio.currentTime / audio.duration  * 100);
            progress.value = progressPercent;
            timeDuration.innerText = _this.timeFormat(audio.duration);
            timeCurrent.innerText = _this.timeFormat(audio.currentTime);
          }
        }

        // When a song is seeked
        progress.oninput = function(e) { 
          const seekTime = audio.duration / 100  * e.target.value;
          audio.currentTime = seekTime;
        }

        //Next a song
        nextBtn.onclick = function() { 
          if (_this.isRandom) {
            _this.playRandomSong();
          } else {
            _this.nextSong();
          }
          audio.play();
          _this.render();
          _this.scrollToActiveSong();
        }

        //Prev a song
        prevBtn.onclick = function() { 
          if (_this.isRandom) {
            _this.playRandomSong();
          } else {
            _this.prevSong();
          }
          audio.play();
          _this.scrollToActiveSong();
        }

        //random a song
        randomBtn.onclick = function() { 
            _this.isRandom = !_this.isRandom;
            _this.setConfig('isRandom', _this.isRandom);
            randomBtn.classList.toggle('active', _this.isRandom);
        }

        //repeat a song
        repeatBtn.onclick = function() { 
            _this.isRepeat = !_this.isRepeat;
            _this.setConfig('isRepeat', _this.isRepeat);
            repeatBtn.classList.toggle('active', _this.isRepeat);
         }

        //handle next song after audio ended
        audio.onended = function() { 
          if(_this.isRepeat) { 
              audio.play();
          } else {
             nextBtn.click();
          }
        }

        //listen to playlist click behavior: click to a song and play it
        playlist.onclick = function(e) { 
            const songNode = e.target.closest('.song:not(.active)');
            const optionNode = e.target.closest('.option');
            const heartNode = e.target.closest('.add-favorite-icon');
            if (songNode || optionNode || heartNode) {
              // handle when click on a song  => play that song
                if(songNode) {
                  //get data-index of clicked song
                    _this.currentIndex = Number(songNode.dataset.index);
                    _this.loadCurrentSong();
                    _this.render();
                    audio.play();
                }
              //handle when click on option of a song => dont play
              if(optionNode) {
                  audio.pause();
              }
              //handle when click on option of a song => dont play
              if(heartNode) {
                audio.pause();
            }
            }
        }

    },
    scrollToActiveSong: function() {
        setTimeout(() => {
            $('.song.active').scrollIntoView({          
              behavior: "smooth",
              block: "center"
            })
        }, 300)
    },
    timeFormat(seconds) {
        let minute = Math.floor(seconds / 60);
        let second = Math.floor(seconds % 60);
        minute = minute < 10 ? "0" + minute : minute;
        second = second < 10 ? "0" + second : second;
        return minute + ":" + second;
    },
    loadCurrentSong: function() {
        // console.log(heading, cdThumb, audio);

        heading.textContent = this.currentSong.name;
        cdThumb.style.backgroundImage = `url('${this.currentSong.image}')`;
        audio.src = this.currentSong.path;
    },
    loadConfig: function() { 
        this.isRandom = this.config.isRandom;
        this.isRepeat = this.config.isRepeat;

        // Object.assign(this, this.config);
    },
    nextSong: function() {
        this.currentIndex++;
        if(this.currentIndex >= this.songs.length) { 
          this.currentIndex = 0;
        }
        this.loadCurrentSong();
    },
    prevSong: function() {
      this.currentIndex--;
      if(this.currentIndex < 0) { 
        this.currentIndex = this.songs.length - 1;
      }
      this.loadCurrentSong();
    },
    playRandomSong: function() { 
        let newIndex;
        do {
          newIndex = 
            Math.floor(Math.random() * this.songs.length);
        } while (newIndex == this.currentIndex);
        
        this.currentIndex = newIndex;
        this.loadCurrentSong();
    },
    start: function() {
        //assign configuration from config to app object - gán cấu hình từ config vào ứng dụng
        this.loadConfig();

        //Define properties for object
        this.defineProperties();  

        //Listen and handle events
        this.handleEvents();

        //Download all info of the first song into UI when the app plays
        this.loadCurrentSong();

        //Render playlist
        this.render();


        //Hien thi trang thai ban dau cua button repeat va random
        randomBtn.classList.toggle('active', this.isRandom);
        repeatBtn.classList.toggle('active', this.isRepeat);
    }
}

app.start();