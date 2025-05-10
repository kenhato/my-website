document.addEventListener('DOMContentLoaded', async () => {
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

    // MusicKit初期化
    try {
        console.log("MusicKit初期化を開始...");
        await MusicKit.configure({
            developerToken: "eyJhbGciOiJFUzI1NiIsImtpZCI6Ik5GSjY1MjM3VzgiLCJ0eXAiOiJKV1QifQ.eyJpc3MiOiI4V1czTlFQN0FWIiwiZXhwIjoxNzUzOTk5Mzk4LCJpYXQiOjE3MzgzNjA5OTh9.xxXeM53b6eOaRkjkGukgmjkDupEXGpnVGfwutYehW3eHTkZ6BsqM1yAq8RObNJs5dh_6dALFtgb9KWxFjQwAAg", // トークンを設定
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

// Apple Music API から曲を取得する関数
async function fetchNowPlayingSong(musicUserToken) {
    const music = MusicKit.getInstance(); // MusicKitインスタンス取得
    const developerToken = music.developerToken; 

    try {
        const response = await fetch("https://api.music.apple.com/v1/me/recent/played/tracks?limit=1", {
            method: "GET",
            headers: {
                "Authorization": `Bearer ${developerToken}`,
                "Music-User-Token": musicUserToken,
                "Cache-Control": "no-cache"
            }
        });

        if (!response.ok) {
            throw new Error(`APIエラー: ${response.status}`);
        }

        const data = await response.json();

        // 直近に再生した曲の情報を取得
        const nowPlaying = data.data?.[0]?.attributes;
        if (!nowPlaying) {
            alert("現在再生中の曲が取得できませんでした。");
            return null;
        }

        return {
            title: nowPlaying.name || "Unknown Title",
            artist: nowPlaying.artistName || "Unknown Artist",
            url: nowPlaying.url || "https://music.apple.com/"
        };

    } catch (error) {
        console.error("曲情報取得エラー:", error);
        alert("曲情報の取得に失敗しました。");
        return null;
    }
}

// 認証⇒fetchNowPlayingSongから取得した曲をツイートする関数
async function tweetNowPlaying() {
    const music = MusicKit.getInstance();

    try {
        const musicUserToken = await music.authorize();

        // Apple Music API を使って曲情報を取得
        const nowPlaying = await fetchNowPlayingSong(musicUserToken);

        if (!nowPlaying) {
            alert("現在再生中の曲がありません！");
            return;
        }

         // `?i=` を `?&i=` に変換
         const fixedUrl = nowPlaying.url.replace("?i=", "?&i=");

        const tweetContent = `#NowPlaying ${nowPlaying.title} - ${nowPlaying.artist}\n${fixedUrl}`;
        const tweetUrlWeb = `https://twitter.com/intent/tweet?text=${encodeURIComponent(tweetContent)}`;
        console.log("ツイート内容:", tweetContent);

        // ツイートページにリダイレクト
        window.location.href = tweetUrlWeb;
    } catch (err) {
        console.error("認証エラーまたは曲情報取得エラー:", err);
        alert("Apple Music の認証またはデータ取得に失敗しました。");
    }
}




