document.addEventListener('DOMContentLoaded', async () => {
    // ボタンクリックのイベント設定
    document.getElementById('shuffleButton1').addEventListener('click', () => shuffleAndTweet('休憩なう'));
    document.getElementById('shuffleButton2').addEventListener('click', () => shuffleAndTweet('お昼休憩なう'));
    document.getElementById('shuffleButton3').addEventListener('click', () => shuffleAndTweet('夜休憩なう'));
    document.getElementById('painLevelButton').addEventListener('click', showPainLevelDialog);
    document.getElementById('nowPlayingButton').addEventListener('click', tweetNowPlaying);

    // ダイアログ内ボタンのイベント設定
    document.getElementById('tweetPainButton').addEventListener('click', tweetPainReport);
    document.getElementById('cancelPainButton').addEventListener('click', () => {
        document.getElementById('painLevelDialog').close();
    });

    // MusicKit初期化
    try {
        console.log("MusicKit初期化を開始...");
        await MusicKit.configure({
            developerToken: "eyJhbGciOiJFUzI1NiIsImtpZCI6Ik5GSjY1MjM3VzgiLCJ0eXAiOiJKV1QifQ.eyJpc3MiOiI4V1czTlFQN0FWIiwiZXhwIjoxNzM4MzkyMzc4LCJpYXQiOjE3MzgzNDkxNzh9.0M6VVu-sw5bwh7CNTEBNSEfV-BR0vhMkc9EjWT3kpuru4VJdJ0uQI8d392DxyDzt_-pADaqmz2AKPqSaGxibfg", // トークンを設定
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
        // ユーザー認証
        console.log("認証開始...");
        const musicUserToken = await music.authorize();
        console.log("認証成功！Music User Token:", musicUserToken);

        // 再生中の曲を取得
        const nowPlaying = music.player.nowPlayingItem;
        console.log("現在再生中の曲情報:", nowPlaying);

        if (!nowPlaying) {
            alert("現在再生中の曲がありません！再生中の曲を確認してください。");
            return;
        }

        // 曲情報をツイート内容に設定
        const songTitle = nowPlaying.title || "Unknown Title";
        const artistName = nowPlaying.artistName || "Unknown Artist";
        const url = nowPlaying.url || "https://music.apple.com/";

        const tweetContent = `#Nowplaying ${songTitle} by ${artistName}\n${url}`;
        const tweetUrlWeb = `https://twitter.com/intent/tweet?text=${encodeURIComponent(tweetContent)}`;
        console.log("ツイート内容:", tweetContent);

        // ツイートページにリダイレクト
        window.location.href = tweetUrlWeb;
    } catch (err) {
        // エラーをキャッチして詳細をログに出力
        console.error("認証エラーまたは曲情報取得エラー:", err);

        // エラー内容に応じて適切なメッセージを表示
        if (err.name === "AUTHORIZATION_ERROR") {
            alert("認証エラーが発生しました。再度ログインしてください。");
        } else if (err.message && err.message.includes("Cannot read properties of null")) {
            alert("再生中の曲情報が取得できませんでした。曲が再生されているか確認してください。");
        } else {
            alert("Apple Musicの認証またはデータ取得に失敗しました。");
        }
    }
}




