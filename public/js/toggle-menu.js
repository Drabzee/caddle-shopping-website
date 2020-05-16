// var toggleButton = document.getElementById("toggle-button");
// var menu = document.getElementById("menu");

// toggleButton.addEventListener('click', () => {
//     menu.style.display = menu.style.display === "none" ? "block" : "none";
// });

$(document).ready(function(){
    $("#toggle-button").click(function(){
        $("#menu").slideToggle(300);
    });

    $('.custom-file-input input[type="file"]').change(function(e){
        $(this).siblings('input[type="text"]').val(e.target.files[0].name);
    });
});