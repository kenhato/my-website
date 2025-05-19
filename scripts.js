document.addEventListener('DOMContentLoaded', async () => {
  // ボタンイベント登録
  document.getElementById('shuffleButton1').addEventListener('click', () => {
    handleClickWithPopup(() => shuffleAndTweet('休憩なう'));
  });
  document.getElementById('shuffleButton2').addEventListener('click', () => {
    handleClickWithPopup(() => shuffleAndTweet('お昼休憩なう'));
  });
  document.getElementById('shuffleButton3').addEventListener('click', () => {
    handleClickWithPopup(() => shuffleAndTweet('夜休憩なう'));
  });
  document.getElementById('painLevelButton').addEventListener('click', () => {
    handleClickWithPopup(showPainLevelDialog);
  });
  document.getElementById('nowPlayingButton').addEventListener('click', () => {
    handleClickWithPopup(tweetNowPlaying);
  });
  document.getElementById('tweetPainButton').addEventListener('click', tweetPainReport);
  document.getElementById('cancelPainButton').addEventListener('click', () => {
    document.getElementById('painLevelDialog').close();
  });

  // MusicKit初期化
  await initMusicKitWithCache();
});


// ↓ ここはdocument.addEventListenerの外に定義！
const TOKEN_KEY = "appleDevToken";
const EXPIRY_KEY = "appleDevTokenExpiry";
const THREE_MONTHS_MS = 90 * 24 * 60 * 60 * 1000;

async function initMusicKitWithCache() {
  try {
    let token = localStorage.getItem(TOKEN_KEY);
    const expiry = Number(localStorage.getItem(EXPIRY_KEY));
    const now = Date.now();

    if (!token || !expiry || now > expiry) {
      console.log("🔄 トークン未取得 or 有効期限切れ → 新規取得");
      const res = await fetch("https://llgctsrfu5.execute-api.ap-southeast-2.amazonaws.com/generate_JWT_token");
      const data = await res.json();
      token = data.token;

      localStorage.setItem(TOKEN_KEY, token);
      localStorage.setItem(EXPIRY_KEY, (now + THREE_MONTHS_MS).toString());
    } else {
      console.log("✅ トークンキャッシュから取得（有効）");
    }

    console.log("🎶 MusicKit初期化中…");
    await MusicKit.configure({
      developerToken: token,
      app: {
        name: "TweetGenerator",
        build: "1.0.0"
      }
    });

    console.log("✅ MusicKit初期化成功！");
    await ShowRecentSong();

  } catch (error) {
    console.error("MusicKit初期化中にエラー:", error);
  }
}

// 確率でポップアップを出す共通関数
function handleClickWithPopup(callback) {
    const randomValue = Math.random();
    const popupChance = 0.05; // ポップアップ表示
    if (randomValue < popupChance) {
        alert("使ってくれてありがとう！");
    }
    callback();
}

// 文字をシャッフルしてツイート
function shuffleAndTweet(originalString) {
    const array = originalString.split('');
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    const shuffledString = array.join('');
    const tweetContent = `${shuffledString} #休憩なう`;

    const tweetUrlWeb = `https://twitter.com/intent/tweet?text=${encodeURIComponent(tweetContent)}`;
    window.location.href = tweetUrlWeb;
}

// 腹痛ツイート関連
function showPainLevelDialog() {
    const dialog = document.getElementById("painLevelDialog");
    dialog.showModal();
}

function tweetPainReport() {
    const painLevel = document.getElementById("painLevelSelect").value;
    const tweetContent = `腹痛レベル：${painLevel}\n#ピノキオピー腹痛サークル`;

    const tweetUrlWeb = `https://twitter.com/intent/tweet?text=${encodeURIComponent(tweetContent)}`;
    window.location.href = tweetUrlWeb;

    document.getElementById("painLevelDialog").close();
}

async function fetchNowPlayingSong() {
    const music = MusicKit.getInstance(); 
    const developerToken = music.developerToken;

    const fetchTrack = async () => {
        const token = music.musicUserToken;
        const response = await fetch("https://api.music.apple.com/v1/me/recent/played/tracks?limit=1", {
            method: "GET",
            headers: {
                "Authorization": `Bearer ${developerToken}`,
                "Music-User-Token": token,
                "Cache-Control": "no-cache"
            }
        });

        if (!response.ok) {
            throw new Error(`APIエラー: ${response.status}`);
        }

        const data = await response.json();
        const nowPlaying = data.data?.[0]?.attributes;
        if (!nowPlaying) return null;

        return {
            title: nowPlaying.name || "Unknown Title",
            artist: nowPlaying.artistName || "Unknown Artist",
            url: nowPlaying.url || "https://music.apple.com/",
            artworkUrl: nowPlaying.artwork?.url.replace('{w}x{h}', '500x500') || ""
        };
    };

    try {
        return await fetchTrack();
    } catch (error) {
        console.warn("初回トークンで失敗:", error.message);

        if (error.message.includes("401") || error.message.includes("403")) {
            try {
                await music.unauthorize();
                await music.authorize(); // トークンは自動で music.musicUserToken にセットされる
                console.log("再認証成功、トークン再取得");
                return await fetchTrack();
            } catch (reauthError) {
                console.error("再認証失敗:", reauthError);
                alert("Apple Music の再認証に失敗しました。");
                return null;
            }
        } else {
            console.error("その他のエラー:", error);
            alert("曲情報の取得に失敗しました。");
            return null;
        }
    }
}

async function tweetNowPlaying() {
    const music = MusicKit.getInstance();

    try {
        await music.authorize(); 

        const nowPlaying = await fetchNowPlayingSong();

        if (!nowPlaying) {
            alert("現在再生中の曲がありません！");
            return;
        }

        const fixedUrl = nowPlaying.url.replace("?i=", "?&i=");
        const tweetContent = `#NowPlaying ${nowPlaying.title} - ${nowPlaying.artist}\n${fixedUrl}`;
        const tweetUrlWeb = `https://twitter.com/intent/tweet?text=${encodeURIComponent(tweetContent)}`;

        console.log("ツイート内容:", tweetContent);
        window.location.href = tweetUrlWeb;
    } catch (err) {
        console.error("認証エラーまたは曲情報取得エラー:", err);
        alert("Apple Music の認証またはデータ取得に失敗しました。");
    }
}


// 曲表示用の関数。はっぴーべりーはっぴーの場合出し分け
const SPECIAL_SONG = "はっぴーべりーはっぴー";
const SPECIAL_ARTIST = "ピノキオピー";

async function ShowRecentSong() {
  const music = MusicKit.getInstance();

  try {
    if (!music.isAuthorized) return;

    const token = await music.authorize();

    const nowPlaying = await fetchNowPlayingSong(token);
    if (nowPlaying) {

      if (nowPlaying.title.includes(SPECIAL_SONG) && nowPlaying.artist.includes(SPECIAL_ARTIST)) {
        document.body.classList.add("happyberry-mode");
        document.getElementById("sparkleEffect").style.display = "block";
      }

      document.getElementById("albumImage").src = nowPlaying.artworkUrl;
      document.getElementById("songTitle").textContent = nowPlaying.title;
      document.getElementById("artistName").textContent = nowPlaying.artist;
      document.getElementById("nowPlayingCard").classList.remove("hidden");
      document.getElementById("tweetNowPlaying").onclick = () => {
        const tweetContent = `#NowPlaying ${nowPlaying.title} - ${nowPlaying.artist}\n${nowPlaying.url}`;
        window.location.href = `https://twitter.com/intent/tweet?text=${encodeURIComponent(tweetContent)}`;
      };
      document.getElementById("nowPlayingCard").classList.remove("hidden");
    }
  } catch (err) {
    console.warn("再生中の曲取得スキップ：", err);
  }
}





