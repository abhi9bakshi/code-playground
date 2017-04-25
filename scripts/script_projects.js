$(function(){
  $(".content").hover(
    function(){
      // If type is CSS
      if($(this).children("p.type").text() === "CSS"){
        $(this).children(".background").addClass("background-css");
        $(this).children("p").addClass("css");
        $(this).find("i").removeClass("css");
        $(this).addClass("content-border-css");
      // If type is JS
      }else if($(this).children("p.type").text() === "JS"){
        $(this).children(".background").addClass("background-js");
        $(this).children("p").addClass("js");
        $(this).find("i").removeClass("js");
        $(this).addClass("content-border-js");
      }
    },
    function(){
      // If type is CSS
      if($(this).children("p.type").text() === "CSS"){
        $(this).children(".background").removeClass("background-css");
        $(this).children("p, .title").removeClass("css");
        $(this).find("i").addClass("css");
        $(this).removeClass("content-border-css");
      // If type is JS
      }else if($(this).children("p.type").text() === "JS"){
        $(this).children(".background").removeClass("background-js");
        $(this).children("p, .title").removeClass("css");
        $(this).find("i").addClass("js");
        $(this).removeClass("content-border-js");
      }
    });

    $(".project").hover(
      function(){
        $(this).removeClass("col-sm-6 col-lg-4 fixed-maxwidth");
      },
      function(){
        $(this).addClass("col-sm-6 col-lg-4 fixed-maxwidth");
      });
});
