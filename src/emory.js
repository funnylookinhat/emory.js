/**
 * Generic Form Handling through Element Attributes
 */

$(function () {

  $(document).on('click', '[emory-form-click-submit]', function (e) {
    e.preventDefault();
    handleFormSubmit($(this));
  });

  $(document).on('change', '[emory-form-change-submit]', function (e) {
    e.preventDefault();
    handleFormSubmit($(this));
  });

  $(document).on('keydown', '[emory-form-enter-submit]', function (e) {
    var code = e.keyCode || e.which;
    if( code == 13 ) {
      handleFormSubmit($(this));
      return false;
    }
  });

  $(document).on('valid.fndtn.abide', '[emory-form-abide-submit]', function (e) {
    handleFormSubmit($(this));
  });

  setInterval(function () {
    setupFormTimeouts();
  }, 5000);

  $('[emory-form-onload-submit]').each(function () {
    var $form = $(this);
    
    $loadingTarget = false;
    if( $form.attr('emory-form-loading-target') ) {
      $loadingTarget = $($form.attr('emory-form-result-target'));
    } else {
      $loadingTarget = $form.parent();
    }

    $loadingTarget.addClass('emory-loading');
    
    if( $form.is('[emory-form-ajax]') ) {
      submitFormAjax($form);
    } else {
      $form.submit();
    }
  });

  function setupFormTimeouts() {
    $('[emory-form-timeout-submit]').each(function () {
      var $form = $(this);

      if( $form.attr('[emory-form-onload-submit]') &&
          $form.attr('[emory-form-onload-submit]').length ) {
        return;
      }

      var timeoutMillis = $form.attr('emory-form-timeout-submit');
      $form.removeAttr('emory-form-timeout-submit');

      if( ! timeoutMillis.length ) {
        return;
      }

      var timeoutFormId = ''+Math.floor(Math.random() * 999999999)+''+Date.now();
      $form.attr('emory-form-timeout-id',timeoutFormId);

      setTimeout(function () {
        timeoutFormSubmit(timeoutFormId);
      }, parseFloat(timeoutMillis));
    });
  }

  function timeoutFormSubmit(timeoutId) {
    var $form = $('[emory-form-timeout-id="'+timeoutId+'"]');
    if( ! $form.length ) {
      return;
    }

    if( $form.attr('emory-form-timeout-submit-input-name') &&
        $form.attr('emory-form-timeout-submit-input-value') ) {
      $form
        .find('input[name="'+$form.attr('emory-form-timeout-submit-input-name')+'"]')
        .val($form.attr('emory-form-timeout-submit-input-value'));
    }

    if( $form.attr('emory-form-timeout-submit-action') ) {
      $form.attr('action', $form.attr('emory-form-timeout-submit-action'));

      if( $form.attr('emory-form-timeout-submit-action-fallback') ) {
        $form.attr('action-fallback', $actor.attr('emory-form-timeout-submit-action-fallback'));
      }
    }

    $loadingTarget = false;
    if( $form.attr('emory-form-loading-target') ) {
      $loadingTarget = $($form.attr('emory-form-result-target'));
    } else {
      $loadingTarget = $form.parent();
    }

    $loadingTarget.addClass('emory-loading');
    
    if( $form.is('[emory-form-ajax]') ) {
      submitFormAjax($form);
    } else {
      $form.submit();
    }
  }

  function handleFormSubmit($actor) {
    $form = $actor.closest('form');

    if( $actor.attr('emory-form-submit-input-name') &&
        $actor.attr('emory-form-submit-input-value') ) {
      $form
        .find('input[name="'+$actor.attr('emory-form-submit-input-name')+'"]')
        .val($actor.attr('emory-form-submit-input-value'));
    }

    if( $actor.attr('emory-form-submit-action') ) {
      $form.attr('action', $actor.attr('emory-form-submit-action'));

      if( $actor.attr('emory-form-submit-action-fallback') ) {
        $form.attr('action-fallback', $actor.attr('emory-form-submit-action-fallback'));
      }
    }

    if( $actor.is('[emory-form-submit-ajax]') &&
        ! $form.is('[emory-form-ajax]') ) {
      $form.attr('emory-form-ajax','true');
    }
    else if( $actor.is('[emory-form-submit-normal]') &&
             $form.is('[emory-form-ajax]') ) {
      $form.removeAttr('emory-form-ajax');
    }

    $loadingTarget = false;
    if( $form.attr('emory-form-loading-target') ) {
      $loadingTarget = $($form.attr('emory-form-result-target'));
    } else {
      $loadingTarget = $form.parent();
    }

    $loadingTarget.addClass('emory-loading');
    
    if( $form.is('[emory-form-ajax]') ) {
      submitFormAjax($form);
    } else {
      $form.submit();
    }
  }

  function submitFormAjax ($form) {
    $resultTarget = false;
    if( $form.attr('emory-form-result-target') ) {
      $resultTarget = $($form.attr('emory-form-result-target'));
    } else {
      $resultTarget = $form.parent();
    }

    formRemoveAllAlerts($resultTarget, $form.attr('emory-form-transition'));

    if( $form.find('input[type="file"]').length ) {
      
      // If we don't support FormData we have to try to use the fallback.
      if( ! ("FormData" in window) ) {
        return submitFormAjaxFileFallback($form);
      }

      return submitFormAjaxFileFormData($form);
    }

    // $form.serialize() is a piece.
    var formData = {};

    $form.find('input[type="hidden"], input[type="text"], input[type="password"], input[type="date"], input[type="datetime"], input[type="datetime-local"], input[type="month"], input[type="week"], input[type="email"], input[type="number"], input[type="search"], input[type="tel"], input[type="time"], input[type="url"], select, textarea').each(function () {
      formData[$(this).attr('name')] = $(this).val();
    });

    var checkboxValues = {};
    $form.find('input[type="checkbox"], input[type="radio"]').each(function () {
      if( $(this).is(':checked') ) {
        if( ! checkboxValues[$(this).attr('name')] ) {
          checkboxValues[$(this).attr('name')] = $(this).val();
        } else {
          checkboxValues[$(this).attr('name')] = checkboxValues[$(this).attr('name')]+','+$(this).val();
        }
      }
    });

    for( checkboxName in checkboxValues ) {
      formData[checkboxName] = checkboxValues[checkboxName];
    }

    $.ajax({
      url: $form.attr('action'),
      type: "POST",
      data: $.param(formData),
      dataType: 'json',
      success: function (response) {
        return handleFormAjaxSuccess(response, $form);
      },
      error: function (response, message, error) {
        return handleFormAjaxError(response, message, error, $form);
      }
    });
  }

  function submitFormAjaxFileFallback ($form) {
    if( ! $form.attr('action-fallback') ) {
      $resultTarget = false;
      if( $form.attr('emory-form-result-target') ) {
        $resultTarget = $($form.attr('emory-form-result-target'));
      } else {
        $resultTarget = $form.parent();
      }
      return formAddAlert($resultTarget, 'Error: missing fallback request target.  Please contact support.', 'error', $form.attr('emory-form-transition'));
    }

    $form.attr('action', $form.attr('action-fallback'));
    $form.attr('enctype', 'multipart/form-data');
    $form.prepend($('<input type="hidden" name="MAX_FILE_SIZE" value="25000000" />'));
    $form.attr('method', 'POST');
    $form.submit();
  }

  function submitFormAjaxFileFormData ($form) {
    var formData = new FormData();
    formData.append('MAX_FILE_SIZE', '25000000');

    $form.find('input[type="hidden"], input[type="text"], input[type="password"], input[type="date"], input[type="datetime"], input[type="datetime-local"], input[type="month"], input[type="week"], input[type="email"], input[type="number"], input[type="search"], input[type="tel"], input[type="time"], input[type="url"], select, textarea').each(function () {
      formData.append($(this).attr('name'), $(this).val());
    });

    var checkboxValues = {};
    $form.find('input[type="checkbox"]').each(function () {
      if( $(this).is(':checked') ) {
        if( ! checkboxValues[$(this).attr('name')] ) {
          checkboxValues[$(this).attr('name')] = $(this).val();
        } else {
          checkboxValues[$(this).attr('name')] = checkboxValues[$(this).attr('name')]+','+$(this).val();
        }
      }
    });

    for( checkboxName in checkboxValues ) {
      formData.append(checkboxName, checkboxValues[checkboxName]);
    }

    // This does not support multi-select file inputs
    $form.find('input[type="file"]').each(function () {
      var fileInput = $(this).get(0);
      formData.append($(this).attr('name'), fileInput.files[0]);
    });

    $.ajax({
      url: $form.attr('action'),
      type: "POST",
      data: formData,
      processData: false,
      contentType: false,
      dataType: 'json',
      success: function (response) {
        return handleFormAjaxSuccess(response, $form);
      },
      error: function (response, message, error) {
        return handleFormAjaxError(response, message, error, $form);
      }
    });
  }

  function handleFormAjaxSuccess(response, $form) {
    if( response.callback_url ) {
      if( response.callback_url == window.location.href ) {
        window.location.reload(true);
      } else {
        window.location.href = response.callback_url;
      }
      return;
    }

    if( $form.attr('emory-form-loading-target') ) {
      $loadingTarget = $($form.attr('emory-form-result-target'));
    } else {
      $loadingTarget = $form.parent();
    }
    $loadingTarget.removeClass('emory-loading');

    $resultTarget = false;
    if( $form.attr('emory-form-result-target') ) {
      $resultTarget = $($form.attr('emory-form-result-target'));
    } else {
      $resultTarget = $form.parent();
    }

    if( ! response.success ) {
      return formAddAlert($resultTarget, response.error, 'error', $form.attr('emory-form-transition'));
    }

    return ajaxSuccessPreHide(response, $form);
  }

  function handleFormAjaxError(response, message, error, $form) {
    if( $form.attr('emory-form-loading-target') ) {
      $loadingTarget = $($form.attr('emory-form-result-target'));
    } else {
      $loadingTarget = $form.parent();
    }
    $loadingTarget.removeClass('emory-loading');

    $resultTarget = false;
    if( $form.attr('emory-form-result-target') ) {
      $resultTarget = $($form.attr('emory-form-result-target'));
    } else {
      $resultTarget = $form.parent();
    }

    // Consider removing this after testing.
    return formAddAlert($resultTarget, 'Request error: '+message, 'info', $form.attr('emory-form-transition'));
  }

  function ajaxSuccessPreHide(response, $form) {
    if( ! $form.attr('emory-form-ajax-success-pre-hide-target') ) {
      return ajaxSuccessPreShow(response, $form);
    }

    formHideTarget(
      $($form.attr('emory-form-ajax-success-pre-hide-target')), 
      $form.attr('emory-form-transition'), 
      function () {
        return ajaxSuccessPreShow(response, $form);
      }
    );
  }

  function ajaxSuccessPreShow(response, $form) {
    if( ! $form.attr('emory-form-ajax-success-pre-show-target') ) {
      return ajaxSuccessLoadViews(response, $form);
    }

    formShowTarget(
      $($form.attr('emory-form-ajax-success-pre-show-target')), 
      $form.attr('emory-form-transition'), 
      function () {
        return ajaxSuccessLoadViews(response, $form);
      }
    );
  }

  function ajaxSuccessLoadViews(response, $form) {
    $slideDownQueue = $();

    if( response.message ) {
      $resultTarget = false;
      if( $form.attr('emory-form-result-target') ) {
        $resultTarget = $($form.attr('emory-form-result-target'));
      } else {
        $resultTarget = $form.parent();
      }
      formAddAlert($resultTarget, response.message, 'success', $form.attr('emory-form-transition'));
    }

    // Loop other views.
    for( viewIndex in response.data.views ) {
      $newView = $(response.data.views[viewIndex]);
      $newView.hide();
      $slideDownQueue.add($newView);

      if( $form.attr('emory-form-ajax-success-view-'+viewIndex+'-replace-target') ) {
        $oldView = $($form.attr('emory-form-ajax-success-view-'+viewIndex+'-replace-target'));
        $oldView.after($newView);
        $oldView.remove();
      } else {
        if( $form.attr('emory-form-ajax-success-view-'+viewIndex+'-prepend-target') ) {
          $target = $($form.attr('emory-form-ajax-success-view-'+viewIndex+'-prepend-target'));
          $target.prepend($newView);
        } else if( $form.attr('emory-form-ajax-success-view-'+viewIndex+'-append-target') ) {
          $target = $($form.attr('emory-form-ajax-success-view-'+viewIndex+'-append-target'));
          $target.append($newView);
        }
      }

      if( $form.attr('emory-form-ajax-success-view-'+viewIndex+'-fire-event') ) {
        formShowTarget(
          $newView, 
          $form.attr('emory-form-transition'), 
          function () {
            $newView.trigger($form.attr('emory-form-ajax-success-view-'+viewIndex+'-fire-event'));
          }
        );
      } else {
        formShowTarget(
          $newView, 
          $form.attr('emory-form-transition')
        );
      }
    }

    if( ! $slideDownQueue.length ) {
      return ajaxSuccessPostHide(response, $form);
    }

    formShowTarget(
      $slideDownQueue, 
      $form.attr('emory-form-transition'), 
      function () {
        ajaxSuccessPostHide(response, $form);
      }
    );
  }

  function ajaxSuccessPostHide(response, $form) {
    if( ! $form.attr('emory-form-ajax-success-post-hide-target') ) {
      return ajaxSuccessPostShow(response, $form);
    }

    formHideTarget(
      $($form.attr('emory-form-ajax-success-post-hide-target')), 
      $form.attr('emory-form-transition'), 
      function () {
        return ajaxSuccessPostShow(response, $form);
      }
    );
  }

  function ajaxSuccessPostShow(response, $form) {
    if( ! $form.attr('emory-form-ajax-success-post-show-target') ) {
      return ajaxSuccessCallback(response, $form);
    }

    formShowTarget(
      $($form.attr('emory-form-ajax-success-post-show-target')), 
      $form.attr('emory-form-transition'), 
      function () {
        return ajaxSuccessCallback(response, $form);
      }
    );
  }

  function ajaxSuccessCallback(response, $form) {
    if( ! $form.attr('emory-form-ajax-success-callback') ) {
      return;
    }

    window[$form.attr('emory-form-ajax-success-callback')](response, $form);

    return;
  }

  // Helpers for UI
  
  function formAddAlert($target, alertText, alertClass, transition, callback) {
    if( ! alertClass ) { alertClass = 'info'; }
    if( ! callback ) { callback = function () {}; }
    var $alert = $('<div data-alert="" class="alert-box '+alertClass+'">'+alertText+'<a href="#" class="close">×</a></div>');
    $alert.css('display','none');
    $target.prepend($alert);
    formShowTarget(
      $alert,
      transition,
      callback
    );
  }

  // Remove immediate alert children from $target
  function formRemoveAllAlerts($target, transition) {
    $target.children('.alert-box').each(function () {
      var $alertBox = $(this);
      formHideTarget(
        $alertBox,
        transition,
        function () {
          $alertBox.remove();
        }
      );
    });
  }

  function formHideTarget($target, transition, callback) {
    if( ! transition ||
        Array('slide','fade').indexOf(transition) < 0 ) {
      transition = 'slide';
    }

    if( ! callback ) { 
      callback = function () { /* NADA */ };
    }

    if( transition == 'slide' ) {
      return $target.slideUp().promise().done(callback);
    }

    if( transition == 'fade' ) {
      return $target.fadeOut().promise().done(callback);
    }
  }

  function formShowTarget($target, transition, callback) {
    if( ! transition ||
        Array('slide','fade').indexOf(transition) < 0 ) {
      transition = 'slide';
    }

    if( ! callback ) { 
      callback = function () { /* NADA */ };
    }

    if( transition == 'slide' ) {
      return $target.slideDown().promise().done(callback);
    }

    if( transition == 'fade' ) {
      return $target.fadeIn().promise().done(callback);
    }
  }
});