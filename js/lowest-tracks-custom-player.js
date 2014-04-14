/*
*
*   JavaScript code for the project "I listen to songs that don't even exist yet"
*
*   AUTHOR:     d_t 
*   CONTACTS:   www.davidetotaro.com
*               @tanototo
*               davide[dot]totaro[at]gmail[dot]com
*
*/


// -------------- Constants and variables -------------- //

// Global constants
const tracksLimit    = 200;
const tracksPerPage  = 10;
const playcountLimit = 10;
const scClientIds = [/* List of SoundCloud client ids */];

// Music genres
var allGenres = [
                "Acid Jazz",
                "Acoustic Rock",
                "Alternative", 
                "Ambient", 
                "Art Rock",
                "Breakbeat",
                "Chillout",
                "Chillwave",
                "Chiptunes",
                "Crunkstep",
                "Digital Hardcore",
                "Downtempo",
                "Dream Pop",
                "Easy Listening",
                "EBM",
                "Electro Cumbia",
                "Electro Soul",
                "Electronic",
                "Future Funk",
                "Glitch",
                "Glo-Fi",
                "Grime",
                "Gravewave",
                "Grindcore",
                "Hip-Hop",
                "IDM",
                "Indie Pop",
                "Industrial",
                "Lo-Fi",
                "Math Rock",
                "Minimal",
                "Moombahton",
                "Nu Jazz",
                "Nu Rave",
                "Pop",
                "Post Rock",
                "Psychedelic Pop",
                "Shoegaze",
                "Synth Pop",
                "Trap",
                "Trip-Hop",
                "Turntablism",
                "Underground",
                "Vaporwave",
                "Witch House"
                ];
var shuffledGenres = shuffle(allGenres.slice());

// Image backgrounds
var bgFolderPath = 'images/backgrounds/'
var bgFilenames =   [
                    '4284636314_2e77740b50_b.jpg',
                    '5235779073_44741c35aa_b.jpg',
                    '5564810884_b0d8bc6473_b.jpg',
                    '5595439015_90a0d0d227_b.jpg',
                    '5595473649_3a9fd0a9f6_b.jpg',
                    '5596042788_41412c9187_b.jpg',
                    '5669726196_2880360d0b_b.jpg',
                    '8995207471_91b927c150_b.jpg',
                    '9033093626_722946f682_c.jpg',
                    '11269447896_568c7de690_c.jpg',
                    '12208794143_7e9c88e55a_b.jpg'
                    ];

var new_tracks = [];

var currGenre = "";


// -------------- Private functions -------------- //

// Show glyphicons on Chrome
$(document).ready(function()    
{
    var Offset = $('body').offset();
    $('body').offset(Offset);
});


// Shuffle elements within an array
function shuffle(array) {
  var currentIndex = array.length
    , temporaryValue
    , randomIndex
    ;

  // While there remain elements to shuffle...
  while (0 !== currentIndex) {
    // Pick a remaining element...
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex -= 1;
    // And swap it with the current element.
    temporaryValue = array[currentIndex];
    array[currentIndex] = array[randomIndex];
    array[randomIndex] = temporaryValue;
  }
  return array;
}//end shuffle


// Set a random background for the web page
function setRandomBackground(imgsPath){
    // Choose random image from background folder
    var randomIndex = Math.floor(Math.random() * bgFilenames.length);
    var bgPath = bgFolderPath + bgFilenames[randomIndex];
    // Set image as page background
    var htmlElement = document.getElementsByTagName('html')[0];
    htmlElement.style.backgroundImage = 'url(' + bgPath + ')';
}//end setRandomBackground


// -------------- Public functions -------------- //

// Initialize genre buttons:
// - Add genre label
// - Add onclick event which gets the tracks of the specific genre
function initializeGenres(genres){
    var genreButtons = document.getElementsByClassName('genreButton');
    // N genres = N html genres
    var nGenres = genreButtons.length;
    for(var i=0; i<nGenres; i++){ // for each genre...
        var currButton = genreButtons[i];
        currButton.innerHTML = genres[i]; // set genre label
        $(currButton).removeClass('two-row'); // remove class if it was previously set

        if (genres[i].indexOf(' ') > 0){
            currButton.innerHTML = currButton.innerHTML.replace(' ', '<br>'); // force new line
            $(currButton).addClass('two-row'); // add 2-row class
        }

        // When clicked, get tracks for that genre
        currButton.onclick = function(){
            currGenre = this.innerHTML.replace('<br>', ' ');
            // Get tracks
            new_tracks = getGenreTracks(currGenre);
            // Set class
            var activeGenre = document.getElementsByClassName('active-genre');
            if (activeGenre.length > 0){
                $(activeGenre).removeClass('active-genre');
            }
            $(this).addClass('active-genre');
            return false;
        };
    }//end for
}//end initializeGenres


// Get 0-play-count tracks of a specific genre
function getGenreTracks(currGenre){
    // Loading message
    var pCurrGenre = document.getElementById('current-genre');
    pCurrGenre.innerHTML = '';
    var pLoadingGenre = document.getElementById('loading-message');
    pLoadingGenre.innerHTML = "Getting tracks for genre " + currGenre + "</br><p class='small'>Please wait...</p>";

    // Scroll to message element
    if (window.innerWidth > 767){
        $('.row').ScrollTo({
            duration: 2000
        });    
    }
    else{
        $('#message-container').ScrollTo({
            duration: 2000,
            // onlyIfOutside: true
        });
    }

    // Get tracks
    SC.get('/tracks', { limit: tracksLimit, genres: currGenre.toLowerCase(), order: 'created_at', filters: 'streamable'}, function(tracks) {

        tracks = _.sortBy(tracks, 'playback_count'); // order tracks by playback_count

        // Get first tracks only
        new_tracks = []
        for(var i=0; i<tracksPerPage; i++){
            t = tracks[i];
            new_tracks.push(t);
        }

        // Add tracks to page and remove loading message
        addTracksToPage();
        pLoadingGenre.innerHTML = '';
    });
}//end getGenreTracks


// Add tracks to playlist div
function addTracksToPage(){
    // Get playlist container, SC player element and message container
    var playlistContainer = document.getElementById('playlist-container');
    var scPlayerDiv = document.getElementsByClassName('sc-player');
    var messageContainer = document.getElementById('message-container');
    
    if (scPlayerDiv.length != 0){ // div already exists => remove it
        scPlayerDiv = scPlayerDiv[0];
        scPlayerDiv.parentNode.removeChild(scPlayerDiv);
        $.scPlayer.stopAll; // stop sound
    }

    // Create SC player
    scPlayerDiv = document.createElement('div');
    scPlayerDiv.setAttribute('class', 'sc-player');

    // Update playing genre
    var pCurrGenre = document.getElementById('current-genre');
    pCurrGenre.innerHTML = 'Listen to these rare ' + currGenre + ' tracks';

    // Add tracks to player
    for(var j=0; j<new_tracks.length; j++){
        t = new_tracks[j];
        // Create link for streaming
        trackLink = document.createElement('a');
        trackLink.setAttribute('href', t['permalink_url']);
        scPlayerDiv.appendChild(trackLink);
    }

    // Insert player into document and show it
    playlistContainer.appendChild(scPlayerDiv);
    $('div.sc-player').scPlayer({
        autoPlay: true,
        loadArtworks: 1
    });

    // Scroll to player
    if (window.innerWidth > 767){
        $('#message-container').ScrollTo({
            duration: 2000
        });
    }
    else{
        $('#message-container').ScrollTo({
            duration: 2000
        });
    }
}//end addTracksToPage


// -------------- Implementation -------------- //

// Set webpage background
setRandomBackground(bgFolderPath);

// Initialize SoundCloud
currClientId = scClientIds[Math.floor(Math.random() * scClientIds.length)]; // get a random SC client id
SC.initialize({
    client_id: currClientId,
});

// Initialize genres
initializeGenres(allGenres);

// Initialize genres shuffle button
var isShuffled = false;
var shuffleButton = document.getElementById('genre-shuffle');
shuffleButton.onclick = function(){
    if (!isShuffled){ // activate shuffling
        isShuffled = true;
        initializeGenres(shuffledGenres);
        // Toggle activation
        $(this).removeClass('no-active');
        $(this).addClass('yes-active');
        // Change title of link
        this.title = "Genre shuffle is ON"
        // Remove 'active-genre' class from genre button
        $('.active-genre').removeClass('active-genre');
    }
    else{ // deactivate shuffling
        isShuffled = false;
        initializeGenres(allGenres);
        // Toggle activation
        $(this).removeClass('yes-active');
        $(this).addClass('no-active');
        // Change title of link
        this.title = "Genre shuffle is OFF"
        // Remove 'active-genre' class from genre button
        $('.active-genre').removeClass('active-genre');
    }
    return false;
};