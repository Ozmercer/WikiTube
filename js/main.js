'use strict';

var gSavedItems = [];

function init(firstVideo) {
    getVideos('pink floyd');
    getWikiInfo(firstVideo);
    if (localStorage.getItem('savedItems') !== null) {
        gSavedItems = JSON.parse(localStorage.getItem('savedItems'))
    }
    updateWatched()
}

function getVideos(value) {
    if (value === null) {
        var elSearch = document.querySelector('input[name="search"]');
        value = elSearch.value;
        gSavedItems.push(value)
        localStorage.setItem('savedItems', JSON.stringify(gSavedItems));
        updateWatched();
    }
    axios.get(`https://www.googleapis.com/youtube/v3/search?part=snippet&videoEmbeddable=true&type=video&key=AIzaSyBI4sSuwR5wMlBRDzYIn0oCT-cnlEBeF4o&q=${value}`)
    .then(function(res) {
        var videos = res.data.items;
        var newHatmls = videos.map(video => {
            return `
                <div class="snippet" onclick="selectVideo('${video.id.videoId}','${video.snippet.title}')">
                    <img src="${video.snippet.thumbnails.default.url}">
                    <p>${video.snippet.title}</p>
                </div>
            `
        })
        document.querySelector('.videos').innerHTML = newHatmls.join('');
    })
}

function selectVideo(url, title) {
    var elFrame = document.querySelector('iframe');
    elFrame.setAttribute('src', 'https://www.youtube.com/embed/' + url); 
    getWikiInfo(title)
}

function getWikiInfo(title) {
    try {
        var wordEndIdx = title.match(/[^a-zA-Z0-9 ]/).index;
        var searchTerm = (wordEndIdx)? title.slice(0,wordEndIdx) : title;
    } catch (err) {
        var searchTerm = title;
    }
    axios.get(`https://en.wikipedia.org/w/api.php?&origin=*&action=opensearch&search=${searchTerm}&limit=5`)
    .then(function(res) {
        var elWikiTitle = document.querySelector('.wiki-title');
        var elWikiDesc = document.querySelector('.wiki-desc');
        elWikiTitle.innerHTML = (res.data[1][0])? res.data[1][0] : 'No Wikipedia page found';
        elWikiDesc.innerHTML = (res.data[2][0])? res.data[2][0] + 
        `<br><br> <a href="${res.data[3][0]}" target="_blank">Read more</a>`  : '';
    })
}

function updateWatched() {
    var elSearched = document.querySelector('.searched');
    elSearched.innerHTML = gSavedItems.join(' - ')
}

function clearHistory() {
    swal({
        title: "Deleting search history",
        text: "Are you sure you want to continue?",
        icon: "warning",
        buttons: true,
        dangerMode: true,
    })
    .then(function (willDelete) {
        if (willDelete) {
            swal("Search history has been deleted", {
                icon: "success",
            });
            localStorage.setItem('savedItems', '');
            gSavedItems = []
            updateWatched();
        } else {
            swal({title: "Action aborted"});
        }
    });
}

function changeTheme(elColor) {
    var elBody = document.querySelector('body');
    elBody.style.backgroundColor = elColor.value;
}