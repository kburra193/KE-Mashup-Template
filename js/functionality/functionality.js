var $;
$(document).ready(function () {
  /**** JS logic for Menu Icon and Filter Icon  *****/
  $(".hamburger .hamburger__inner").click(function () {
    $(".wrapper").toggleClass("active");
  })
  $("#filter-toggle, #close-filters").click(function () {
    $(".wrapper, #bs-canvas-right").toggleClass("active-filters");
	$('body').css('display', 'flex');
  })
})
