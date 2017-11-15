class basePlayer {
 constructor(options) {
  this._options = options;
  this._state = this.states.STOPPED;
  this._currentUrl = null;
  this._currentPlayer = null;
  this._progressTimer = null;
  this._players = {};
  this._containers = {};
  this._callbacks = {};
  this._elapsedMS = 0;
  this._durationMS = 0;
  this._audioElementsEnabled = false;
  this._iOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;

  const defaultOptions = {
   progressInterval: 1000,
   enableSoundCloud: true,
   enableYouTube: true
  };

  if (!options || !options.elementId) {
   throw new Error("Option 'elementId' is required");
  }

  for (const key in defaultOptions) {
   if (!this._options[key]) {
    this._options[key] = defaultOptions[key];
   }
  }

  this._container = document.querySelector(`#${this._options.elementId}`);


  if (this._options.enableSoundCloud) {
   this.createPlayerContainer('soundcloud');
   this._players.soundcloud = new soundCloudPlayer(this._options, this);
  }

  if (this._options.enableYouTube) {
   this.createPlayerContainer('youtube');
   this._players.youtube = new youTubePlayer(this._options, this);
  }

 }

 createPlayerContainer(type) {
  this._containers[type] = document.createElement('div');
  this._containers[type].setAttribute('class', type);
  this._containers[type].setAttribute('style', 'position:absolute; top:0; left:0; height: 100%; width:100%; display:none;');

  switch (type) {
   case 'soundcloud':
    var errorMessage = document.createElement('p');
    errorMessage.setAttribute('style', 'display:none;');
    errorMessage.appendChild(document.createTextNode('iOS requires more interaction. Please press "Listen in Browser" and remember to thank Apple for the privilege.'));
    this._containers[type].appendChild(errorMessage);
    break;

   case 'youtube':
    var errorMessage = document.createElement('p');
    errorMessage.setAttribute('style', 'display:none;');
    errorMessage.appendChild(document.createTextNode('iOS requires more interaction. Please press play again and remember to thank Apple for the privilege.'));
    this._containers[type].appendChild(errorMessage);
    break;
  }

  this._container.appendChild(this._containers[type]);
 }

 callback(callback, data) {
  if (this._callbacks[callback]) {
   this._callbacks[callback](data);
  }
 }

 generateRandomString(length) {
  let text = "";
  const possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

  for (let i = 0; i < length; i++)
   text += possible.charAt(Math.floor(Math.random() * possible.length));

  return text;
 }

 setState(newState) {
  if (this._state != newState) {
   this._state = newState;

   try {
    switch (this._state) {
     case this.states.STOPPED:
      this._currentUrl = null;
      this._elapsedMS = 0;
      this._durationMS = 0;
      clearInterval(this._progressTimer);
      this.callback('onStopped');
      break;

     case this.states.LOADING:
      clearInterval(this._progressTimer);
      this.callback('onLoading');
      break;

     case this.states.PLAYING:
      clearInterval(this._progressTimer);
      this._progressTimer = setInterval(this.updateProgress.bind(this), this._options.progressInterval);
      this.callback('onPlaying');
      break;

     case this.states.PAUSED:
      clearInterval(this._progressTimer);
      this.callback('onPaused');
      break;
    }
   } catch (e) {
    throw e;
   }
  }
 }

 setVisible(container) {
  for (const key in this._containers) {
   this._containers[key].style.display = 'none';
  }

  this._containers[container].style.display = 'block';
 }

 setDuration(durationMS) {
  this._durationMS = durationMS;
 }

 ended() {
  this.callback('onEnded');
 }

 trackData(data) {
  this.callback('onTrackData', data);
 }

 interactionRequired(type) {
  this.callback('onInteractionRequired', type);
 }

 updateProgress() {
  try {
   this._currentPlayer.getProgress(elapsedMS => {
    this._elapsedMS = elapsedMS;

    this.callback('onProgress', {
     elapsedMS: this._elapsedMS,
     durationMS: this._durationMS
    });
   });
  } catch (e) {
   clearInterval(this._progressTimer);
   throw e;
  }
 }

 enableAudioElement(audioElement) {
  const onPlay = e => {
   audioElement.removeEventListener('play', onPlay, false);
  };

  audioElement.addEventListener('play', onPlay, false);
  audioElement.play();
 }

 playUrl(url) {
  try {
   // enable all audio elements for iOS
   if (!this._audioElementsEnabled) {
    for (const key in this._players) {
     if (this._players[key]._audioElement) {
      this.enableAudioElement(this._players[key]._audioElement);
     }
    }

    this._audioElementsEnabled = true;
   }

   if (this._state != this.states.STOPPED) {
    this._currentPlayer.stop();
   }

   this.setState(this.states.LOADING);

   // determine url type
   if (url.includes('youtu.be') || url.includes('youtube.com')) {
    this.setVisible('youtube');
    this._currentPlayer = this._players.youtube;
    this._currentPlayer.playUrl(url);
   } else if (url.includes('soundcloud.com')) {
    this.setVisible('soundcloud');
    this._currentPlayer = this._players.soundcloud;
    this._currentPlayer.playUrl(url);
   }

   return this._currentPlayer._type;
  } catch (e) {
   throw e;
  }
 }

 play() {
  try {
   this._currentPlayer.play();
  } catch (e) {
   throw e;
  }
 }

 pause() {
  try {
   this._currentPlayer.pause();
  } catch (e) {
   throw e;
  }
 }

 togglePlayPause() {
  try {
   if (this._state == this.states.PLAYING) {
    this._currentPlayer.pause();
   } else if (this._state == this.states.PAUSED) {
    this._currentPlayer.play();
   }
  } catch (e) {
   throw e;
  }
 }

 seek(positionMS) {
  try {
   this._currentPlayer.seek(positionMS);
  } catch (e) {
   throw e;
  }
 }

 stop() {
  try {
   this._currentPlayer.stop();
  } catch (e) {
   throw e;
  }
 }

 onStopped(callback) {
  this._callbacks.onStopped = callback;
 }

 onLoading(callback) {
  this._callbacks.onLoading = callback;
 }

 onPlaying(callback) {
  this._callbacks.onPlaying = callback;
 }

 onPaused(callback) {
  this._callbacks.onPaused = callback;
 }

 onEnded(callback) {
  this._callbacks.onEnded = callback;
 }

 onProgress(callback) {
  this._callbacks.onProgress = callback;
 }

 onTrackData(callback) {
  this._callbacks.onTrackData = callback;
 }

 onInteractionRequired(callback) {
  this._callbacks.onInteractionRequired = callback;
 }
}

basePlayer.prototype.states = {
 STOPPED: 0,
 LOADING: 1,
 PLAYING: 2,
 PAUSED: 3
};

class abstractPlayer {
 playUrl(url) {
  throw new Error('Load method not implemented');
 }

 play() {
  throw new Error('Play method not implemented');
 }

 pause() {
  throw new Error('Pause method not implemented');
 }

 stop() {
  throw new Error('Stop method not implemented');
 }

 getProgress(callback) {
  throw new Error('Get progress method not implemented');
 }

 seek(positionMS) {
  throw new Error('Seek method not implemented');
 }
}

class soundCloudPlayer {
 constructor(options, player) {
  this._type = 'soundcloud';
  this._player = player;
  this._options = options;
  this._scriptLoaded = false;
  this._widget = null;
  this._scTrack = null;
  this._audioElement = null;
  this._firstPlay = true;
  this._seekTo = -1;

  if (this._options.scClientId) {
   this.loadScript('https://connect.soundcloud.com/sdk/sdk-3.1.2.js', () => {
    SC.initialize({ client_id: this._options.scClientId });
    this._scriptLoaded = true;
   });

   // setup the audio element
   this._audioElement = document.createElement('audio');
   this._player._containers.soundcloud.appendChild(this._audioElement);
   this._audioElement.addEventListener('waiting', this.httpOnLoad.bind(this));
   this._audioElement.addEventListener('playing', this.httpOnPlay.bind(this));
   this._audioElement.addEventListener('pause', this.httpOnPause.bind(this));
   this._audioElement.addEventListener('ended', this.httpOnEnd.bind(this));
  } else {
   // use widget-style player.
   // unfortunately this requires shit-loads of user interaction on iOS, but that's the glory of apple.
   this.loadScript('https://w.soundcloud.com/player/api.js', () => {
    this._scriptLoaded = true;
   });
  }
 }

 loadScript(script, callback) {
  const scriptElement = document.createElement('script');
  scriptElement.src = script;
  scriptElement.onload = callback;
  document.body.appendChild(scriptElement);
 }

 createWidget(url) {
  const iframeElement = document.createElement('iframe');
  iframeElement.setAttribute('src', `https://w.soundcloud.com/player/?url=${encodeURIComponent(url)}`);
  iframeElement.setAttribute('style', 'height:100%; width:100%;');
  this._player._containers.soundcloud.appendChild(iframeElement);

  this._widget = SC.Widget(iframeElement);
  this._widget.bind(SC.Widget.Events.READY, this.widgetOnReady.bind(this));
  this._widget.bind(SC.Widget.Events.PLAY, this.widgetOnPlay.bind(this));
  this._widget.bind(SC.Widget.Events.FINISH, this.widgetOnEnded.bind(this));
 }

 playUrl(url) {
  // wait for API script to load
  if (!this._scriptLoaded) {
   setTimeout(() => {
    this.playUrl(url);
   }, 500);

   return;
  }

  if (this._options.scClientId) {
   SC.resolve(url).then(track => {
     this._player.trackData(track);
     this._scTrack = track;
     this._audioElement.setAttribute('src', `${track.stream_url}?client_id=${this._options.scClientId}`);
     this._audioElement.play();
   });
  } else {
   if (!this._widget) {
    // create widget
    this.createWidget(url);
   } else {
    // load url in existing widget
    const auto_play = (this._firstPlay && this._player._iOS) ? false : true;
    this._widget.load(url, {
     auto_play
    });
   }

   if (this._player._iOS) {
    this._player._containers[this._type].firstChild.style.display = 'block';
    this._player.interactionRequired(this._type);
   }
  }
 }

 httpOnLoad() {
  this._player.setState(this._player.states.LOADING);
 }

 httpOnPlay() {
  this._firstPlay = false;
  this._player.setState(this._player.states.PLAYING);
  this._player.setDuration(this._audioElement.duration * 1000);
 }

 httpOnPause() {
  this._player.setState(this._player.states.PAUSED);
 }

 httpOnEnd() {
  this._player.setState(this._player.states.STOPPED);
  this._player.ended();
 }

 widgetOnReady() {
  if (!this._player._iOS) {
   this.play();
  }
 }

 widgetOnPlay() {
  this._firstPlay = false;
  this._player.setState(this._player.states.PLAYING);
  this._widget.getCurrentSound(sound => {
   this._player.setDuration(sound.duration);
   //this._player.trackData( sound );

  });


  if (this._player._iOS) {
   this._player._containers[this._type].firstChild.style.display = 'none';
  }
 }

 widgetOnEnded() {
  // only handle if state is playing since FUCKING iOS fires this twice. FUCKING iOS. fuck apple.
  if (this._player._state == this._player.states.PLAYING) {
   this._player.setState(this._player.states.STOPPED);
   this._player.ended();
  }
 }

 play() {
  if (this._options.scClientId) {
   this._audioElement.play();
  } else {
   this._widget.play();
  }
 }

 pause() {
  if (this._options.scClientId) {
   this._audioElement.pause();
  } else {
   this._widget.pause();
   this._player.setState(this._player.states.PAUSED);
  }
 }

 stop() {
  if (this._options.scClientId) {
   this._audioElement.src = '';
  } else {
   this._widget.pause();
  }

  this._player.setState(this._player.states.STOPPED);
 }

 getProgress(callback) {
  if (this._options.scClientId) {
   callback(this._audioElement.currentTime * 1000);
  } else {
   if (this._seekTo > 0) {
    callback(this._seekTo);
   } else {
    this._widget.getPosition(callback);
   }

  }
 }

 seek(positionMS) {
  if (this._options.scClientId) {
   this._audioElement.currentTime = positionMS / 1000;
  } else {
   this._seekTo = positionMS;
   setTimeout(() => {
    this._seekTo = -1;
   }, 2000);

   this._widget.seekTo(positionMS);
  }
 }
}

soundCloudPlayer.prototype = Object.create(abstractPlayer.prototype);

class youTubePlayer {
 constructor(options, player) {
  this._type = 'youtube';
  this._player = player;
  this._options = options;
  this._ytPlayer = null;
  this._waitLimit = 10000;
  this._waitTimer = null;
  this._initializing = false;
  this._ready = false;
  this._readyError = false;
  this._firstPlay = true;
 }

 init(videoId) {
  this._initializing = true;

  const ytPlayerId = `pp-yt-player-${this._player.generateRandomString(8)}`;
  let iframeSrc = `https://www.youtube.com/embed/${videoId}?enablejsapi=1`;
  const iframeElement = document.createElement('iframe');
  const origin = `${location.protocol}//${location.hostname}${location.port ? ':' + location.port : ''}`;
  if (!origin.includes('file://')) iframeSrc += `&origin=${origin}`;
  iframeElement.setAttribute('id', ytPlayerId);
  iframeElement.setAttribute('type', 'text/html');
  iframeElement.setAttribute('width', '100%');
  iframeElement.setAttribute('height', '100%');
  iframeElement.setAttribute('src', iframeSrc);
  iframeElement.setAttribute('frameborder', 0);
  this._player._containers.youtube.appendChild(iframeElement);

  const scriptElement = document.createElement('script');
  scriptElement.src = 'https://www.youtube.com/iframe_api';
  const firstScriptTag = document.getElementsByTagName('script')[0];
  firstScriptTag.parentNode.insertBefore(scriptElement, firstScriptTag);
  scriptElement.onload = () => {
   YT.ready(() => {
    this._waitTimer = setTimeout(() => {
     this._readyError = true;
     throw new Error('YouTube player not initializing. Possible Flash out of date error.');
    }, this._waitLimit);

    this._ytPlayer = new YT.Player(ytPlayerId, {
     playerVars: {
      controls: 0,
      showinfo: 0,
      rel: 0
     },
     events: {
      onReady: event => {
       this.onReady();
      },
      onStateChange: event => {
       this.onStateChange(event);
      },
      onError: event => {
       this.onError(event);
      }
     }
    });
   });
  };
 }

 onReady() {
  clearTimeout(this._waitTimer);
  this._ready = true;
 }

 onError(event) {
  clearTimeout(this._waitTimer);
  this._readyError = true;
  this._player.setState(this._player.states.STOPPED);
  throw new Error(`Error initializing YouTube Player: ${event.data}`);
  console.log(`youtube init error: ${event}`);
 }

 onStateChange(event) {
  if (event.data == YT.PlayerState.PLAYING) {
   if (this._firstPlay && this._player._iOS) {
    this._player._containers[this._type].firstChild.style.display = 'none';
    this._firstPlay = false;
   }

   this._player.setState(this._player.states.PLAYING);
   this._player.setDuration(this._ytPlayer.getDuration() * 1000);
  } else if (event.data == YT.PlayerState.PAUSED) {
   this._player.setState(this._player.states.PAUSED);
  } else if (event.data == YT.PlayerState.BUFFERING) {
   this._player.setState(this._player.states.LOADING);
  } else if (event.data == YT.PlayerState.ENDED) {
   this._player.setState(this._player.states.STOPPED);
   this._player.ended();
  }
 }

 playUrl(url) {
  const videoId = /v=([A-Za-z0-9\-_]+)/.exec(url);

  if (videoId === null) {
   throw new Error("Invalid YouTube URL");
  }

  if (!this._ready && !this._readyError) {
   if (!this._initializing) this.init(videoId)

   return setTimeout(() => {
    this.playUrl(url);
   }, 500);
  } else if (this._readyError) {
   return;
  }

  if (this._firstPlay && this._player._iOS) {
   this._player._containers[this._type].firstChild.style.display = 'block';
   this._player.interactionRequired(this._type);
   this._ytPlayer.cueVideoById(videoId[1], 0.1, 'small');
  } else {
   this._ytPlayer.loadVideoById(videoId[1], 0.1, "small");
  }
 }

 play() {
  if (this._ytPlayer && this._ready) this._ytPlayer.playVideo();
 }

 pause() {
  if (this._ytPlayer && this._ready) this._ytPlayer.pauseVideo();
 }

 stop() {
  if (this._ytPlayer && this._ready) {
   this._ytPlayer.stopVideo();
   this._player.setState(this._player.states.STOPPED);
  }
 }

 getProgress(callback) {
  if (this._ytPlayer && this._ready) callback(this._ytPlayer.getCurrentTime() * 1000);
 }

 seek(positionMS) {
  if (this._ytPlayer && this._ready) this._ytPlayer.seekTo(positionMS / 1000);
 }
}

youTubePlayer.prototype = Object.create(abstractPlayer.prototype);

class exportPlayer {
 constructor(options) {
  this._player = new basePlayer(options);
 }

 playUrl(url) {
  return this._player.playUrl(url);
 }

 play() {
  return this._player.play();
 }

 pause() {
  return this._player.pause();
 }

 togglePlayPause() {
  return this._player.togglePlayPause();
 }

 seek(positionMS) {
  return this._player.seek(positionMS);
 }

 stop() {
  return this._player.stop();
 }

 onStopped(callback) {
  return this._player.onStopped(callback);
 }

 onLoading(callback) {
  return this._player.onLoading(callback);
 }

 onPlaying(callback) {
  return this._player.onPlaying(callback);
 }

 onPaused(callback) {
  return this._player.onPaused(callback);
 }

 onEnded(callback) {
  return this._player.onEnded(callback);
 }

 onProgress(callback) {
  return this._player.onProgress(callback);
 }

 onTrackData(callback) {
  return this._player.onTrackData(callback);
 }

 onInteractionRequired(callback) {
  return this._player.onInteractionRequired(callback);
 }
}
