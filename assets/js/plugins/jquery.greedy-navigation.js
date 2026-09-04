/*
* Greedy Navigation
*
* http://codepen.io/lukejacksonn/pen/PwmwWV
*
*/

var $nav = $('#site-nav');
var $btn = $('#site-nav button');
var $vlinks = $('#site-nav .visible-links');
var $hlinks = $('#site-nav .hidden-links');

var breaks = [];

function updateNav() {

  var availableSpace = $btn.hasClass('hidden') ? $nav.width() : $nav.width() - $btn.width() - 30;

  // The visible list is overflowing the nav
  if($vlinks.width() > availableSpace) {

    while ($vlinks.width() > availableSpace && $vlinks.children('*:not(.masthead__menu-item--lg)').length > 0) {

      // Record the width of the list
      breaks.push($vlinks.width());

      // Move item to the hidden list
      $vlinks.children('*:not(.masthead__menu-item--lg)').last().prependTo($hlinks);

      availableSpace = $btn.hasClass('hidden') ? $nav.width() : $nav.width() - $btn.width() - 30;
      
      // Show the dropdown btn
      if($btn.hasClass('hidden')) {
        $btn.removeClass('hidden');
      }
    }

    // The visible list is not overflowing
  } else {

    // There is space for another item in the nav
    while(breaks.length > 0 && availableSpace > breaks[breaks.length-1]) {
      // Move the item to the visible list
      $hlinks.children().first().appendTo($vlinks);
      breaks.pop();
    }

    // Hide the dropdown btn if hidden list is empty
    if(breaks.length < 1) {
      $btn.addClass('hidden');
      $btn.removeClass('close');
      $hlinks.addClass('hidden');
      $btn.attr('aria-expanded', 'false');
      $btn.attr('aria-label', 'Open navigation menu');
    }
  }

  // Keep counter updated
  $btn.attr("count", breaks.length);

}

// Window listeners

$(window).on('resize', function() {
  updateNav();
});

// Check if screen.orientation is supported before using it
if (screen.orientation && screen.orientation.addEventListener) {
  screen.orientation.addEventListener("change", function(){
    updateNav();
  });
}

$btn.on('click', function() {
  $hlinks.toggleClass('hidden');
  $(this).toggleClass('close');
  var isOpen = !$hlinks.hasClass('hidden');
  $(this).attr('aria-expanded', String(isOpen));
  $(this).attr('aria-label', isOpen ? 'Close navigation menu' : 'Open navigation menu');
});

$hlinks.on('click', 'a', function() {
  $hlinks.addClass('hidden');
  $btn.removeClass('close').attr('aria-expanded', 'false').attr('aria-label', 'Open navigation menu');
});

$(document).on('keydown', function(event) {
  if (event.key === 'Escape' && !$hlinks.hasClass('hidden')) {
    $hlinks.addClass('hidden');
    $btn.removeClass('close').attr('aria-expanded', 'false').attr('aria-label', 'Open navigation menu').focus();
  }
});

updateNav();
