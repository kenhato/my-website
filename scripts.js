// MusicKit初期化
document.addEventListener('DOMContentLoaded', () => {
    MusicKit.configure({
        developerToken: "eyJhb。。。Q", // JWTトークンをここに設定
        app: {
            name: "TweetGenerator",
            build: "1.0.0"
        }
    });

    // ボタンクリックのイベント設定
    document.getElementById('shuffleButton1').addEventListener('click', () => shuffleAndTweet('休憩なう'));
    document.getElementById('shuffleButton2').addEventListener('click', () => shuffleAndTweet('お昼休憩なう'));
    document.getElementById('shuffleButton3').addEventListener('click', () => shuffleAndTweet('夜休憩なう'));
    document.getElementById('painLevelButton').addEventListener('click', showPainLevelDialog);
    document.getElementById('nowPlayingButton').addEventListener('click', tweetNowPlaying);
    document.getElementById('clipboardButton').addEventListener('click', tweetAppleMusicFromClipboard);

    // ダイアログ内ボタンのイベント設定
    document.getElementById('tweetPainButton').addEventListener('click', tweetPainReport);
    document.getElementById('cancelPainButton').addEventListener('click', () => {
        document.getElementById('painLevelDialog').close();
    });
});

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

// Apple Musicの再生中の曲を取得してツイート
async function tweetNowPlaying() {
    const music = MusicKit.getInstance();

    try {
        await music.authorize(); // ユーザー認証

        const nowPlaying = music.player.nowPlayingItem;
        if (!nowPlaying) {
            alert("現在再生中の曲がありません！");
            return;
        }

        const songTitle = nowPlaying.title;
        const artistName = nowPlaying.artistName;
        const url = nowPlaying.url || "https://music.apple.com/";

        const tweetContent = `#Nowplaying ${songTitle} by ${artistName}\n${url}`;
        const tweetUrlWeb = `https://twitter.com/intent/tweet?text=${encodeURIComponent(tweetContent)}`;
        window.location.href = tweetUrlWeb;
    } catch (err) {
        alert("Apple Musicの認証に失敗しました。");
        console.error(err);
    }
}

// クリップボードのApple Music URLをツイート
function tweetAppleMusicFromClipboard() {
    navigator.clipboard.readText()
        .then(originalUrl => {
            if (!originalUrl || !originalUrl.includes("music.apple.com")) {
                alert("Apple MusicのURLをコピーしてください！");
                return;
            }

            const fixedUrl = originalUrl.replace("?i=", "?&i=");
            const tweetContent = `#Nowplaying\n${fixedUrl}`;
            const tweetUrlWeb = `https://twitter.com/intent/tweet?text=${encodeURIComponent(tweetContent)}`;
            window.location.href = tweetUrlWeb;
        })
        .catch(err => {
            alert("クリップボードの内容を取得できませんでした。コピーされているか確認してください！");
            console.error(err);
        });
}
