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
            },
            playback: {
                autoplay: false // ✅ ここで `player` を有効にする！
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

//  まず最初に Apple Music API から曲を取得する関数を定義
async function fetchNowPlayingSong() {
    const music = MusicKit.getInstance();

    // ✅ まず、現在再生中の曲を取得
    const nowPlaying = music.player.nowPlayingItem;

    if (!nowPlaying) {
        console.error("現在再生中の曲がありません！");
        alert("現在再生中の曲がありません！Apple Music で曲を再生してください。");
        return null;
    }

    console.log("現在再生中の曲:", nowPlaying);

    return {
        title: nowPlaying.attributes?.name || "Unknown Title",
        artist: nowPlaying.attributes?.artistName || "Unknown Artist",
        url: nowPlaying.attributes?.url || "https://music.apple.com/"
    };
}


//  その後に `tweetNowPlaying()` を定義
async function tweetNowPlaying() {
    const music = MusicKit.getInstance();

    try {
        console.log("認証開始...");
        const musicUserToken = await music.authorize();
        console.log("認証成功！Music User Token:", musicUserToken);

        // Apple Music API を使って曲情報を取得
        const nowPlaying = await fetchNowPlayingSong(musicUserToken);

        if (!nowPlaying) {
            alert("現在再生中の曲がありません！");
            return;
        }

        console.log("取得した曲情報:", nowPlaying);

        const tweetContent = `#Nowplaying ${nowPlaying.title} by ${nowPlaying.artist}\n${nowPlaying.url}`;
        const tweetUrlWeb = `https://twitter.com/intent/tweet?text=${encodeURIComponent(tweetContent)}`;
        console.log("ツイート内容:", tweetContent);

        // ツイートページにリダイレクト
        window.location.href = tweetUrlWeb;
    } catch (err) {
        console.error("認証エラーまたは曲情報取得エラー:", err);
        alert("Apple Music の認証またはデータ取得に失敗しました。");
    }
}









