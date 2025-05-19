document.addEventListener('DOMContentLoaded', async () => {

    document.addEventListener("DOMContentLoaded", async () => {
  // 🎵 1. MusicKit初期化（トークン取得してconfigure）
  try {
    console.log("トークン取得中…");
    const res = await fetch("https://llgctsrfu5.execute-api.ap-southeast-2.amazonaws.com/generate_JWT_token");
    const { token } = await res.json();

    console.log("MusicKit初期化中…");
    await MusicKit.configure({
      developerToken: token,
      app: {
        name: "TweetGenerator",
        build: "1.0.0"
      }
    });
    console.log("MusicKit初期化成功！");
  } catch (err) {
    console.error("MusicKit初期化エラー:", err);
    return;
  }

  // 🎵 2. MusicKitインスタンスの取得と認証
  const music = MusicKit.getInstance();
  let userToken;
  try {
    userToken = await music.authorize();
  } catch (err) {
    console.warn("ユーザー認証失敗:", err);
    return;
  }

  // 🎵 3. 現在再生中の曲取得＆カード表示
  try {
    const nowPlaying = await fetchNowPlayingSong(userToken);
    if (nowPlaying) {
      document.getElementById("albumImage").src = nowPlaying.artworkUrl;
      document.getElementById("songTitle").textContent = nowPlaying.title;
      document.getElementById("artistName").textContent = nowPlaying.artist;
      document.getElementById("nowPlayingCard").classList.remove("hidden");

      document.getElementById("tweetNowPlaying").onclick = () => {
        const tweetContent = `#NowPlaying ${nowPlaying.title} - ${nowPlaying.artist}\n${nowPlaying.url}`;
        window.location.href = `https://twitter.com/intent/tweet?text=${encodeURIComponent(tweetContent)}`;
      };
    }
  } catch (err) {
    console.warn("曲取得失敗:", err);
  }

  // 🎵 4. ボタンイベントの登録（ここでまとめてOK）
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
});


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
    // ダイアログ内ボタンのイベント設定
    document.getElementById('tweetPainButton').addEventListener('click', tweetPainReport);
    document.getElementById('cancelPainButton').addEventListener('click', () => {
        document.getElementById('painLevelDialog').close();
});

try {
  console.log("トークン取得中…");
  const res = await fetch("https://llgctsrfu5.execute-api.ap-southeast-2.amazonaws.com/generate_JWT_token");
  const { token } = await res.json();

  console.log("MusicKit初期化中…");
  await MusicKit.configure({
    developerToken: token,
    app: {
      name: "TweetGenerator",
      build: "1.0.0"
    }
  });
        console.log("MusicKit初期化成功！");
    } catch (error) {
        console.error("MusicKit初期化中にエラー:", error);
    }
});

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




