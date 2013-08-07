jQuery(document).ready(function($) {
  function maybeScrollToHash() {
    if (window.location.hash && $(window.location.hash).length) {
      var newTop = $(window.location.hash).offset().top - 150;
      $(window).scrollTop(newTop);
    }
  }

  $(window).bind('hashchange', function() {
    maybeScrollToHash();
  });

  maybeScrollToHash();

  $('table').tablesorter()
});
