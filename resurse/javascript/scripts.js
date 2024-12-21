function changeTrailer(event){
    event.preventDefault();
    const iframe = document.getElementById("main-trailer");
    iframe.src = event.target.href;
}