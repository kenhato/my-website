document.addEventListener('DOMContentLoaded', async () => {
    // MusicKit初期化
    MusicKit.configure({
        developerToken: "eyJhbGciOiJFUzI1NiIsImtpZCI6Iks5NUNMUkdLMzYiLCJ0eXAiOiJKV1QifQ.eyJpc3MiOiI4V1czTlFQN0FWIiwiaWF0IjoxNzM1MzQ3ODc0LCJleHAiOjE3NTA4OTk4NzQsImF1ZCI6Imh0dHBzOi8vYXBwbGVpZC5hcHBsZS5jb20ifQ.4GG2np7uOmgW4e1HRoFPV_jy1rPpxD_MqP1P2DFJj9jyzkDJfGVNFtv8DOFlzt4HDo-a0df-LyaW3YPwtLFqDQ", // JWTトークンをここに設定
        app: {
            name: "TweetGenerator",
            build: "1.0.0"
        }
    });

    // 初期化完了を待つ
    const music = await MusicKit.getInstance();

    // 初期化されたインスタンスをログに出力
    console.log("MusicKitインスタンス:", music);
    console.log("使用中のトークン:", music.developerToken);

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

// トークンが正しく設定されたかログを確認
const music = MusicKit.getInstance();
console.log("MusicKitインスタンス:", music);
console.log("使用中のトークン:", music.developerToken);

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
        await music.authorize(); 
        console.log("認証成功！");

        // 再生中の曲を取得
        const nowPlaying = music.player.nowPlayingItem;
        console.log("現在再生中の曲情報:", nowPlaying);

        if (!nowPlaying) {
            alert("現在再生中の曲がありません！");
            return;
        }

        // 曲情報をツイート内容に設定
        const songTitle = nowPlaying.title;
        const artistName = nowPlaying.artistName;
        const url = nowPlaying.url || "https://music.apple.com/";

        const tweetContent = `#Nowplaying ${songTitle} by ${artistName}\n${url}`;
        const tweetUrlWeb = `https://twitter.com/intent/tweet?text=${encodeURIComponent(tweetContent)}`;
        console.log("ツイート内容:", tweetContent);

        // ツイートページにリダイレクト
        window.location.href = tweetUrlWeb;
    } catch (err) {
        // エラーをキャッチして詳細をログに出力
        console.error("認証エラー:", err);

        // エラー内容に応じて適切なメッセージを表示
        if (err.name === "AUTHORIZATION_ERROR") {
            alert("認証エラーが発生しました。トークンを確認してください。");
        } else {
            alert("Apple Musicの認証に失敗しました。");
        }
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


