var Emory = function (params) {
  if( ! params ) {
    params = {};
  }

  this._initInterval = typeof params.initInterval === "number"
                     ? params.initInterval
                     : this.constructor.__initInterval;

  this._attributePrefix = typeof params.attributePrefix === "string" 
                        ? params.attributePrefix
                        : this.constructor.__attributePrefix;

  this._checkResponseSuccess = typeof params.checkResponseSuccess === "function" 
                     ? params.checkResponseSuccess
                     : this.constructor.__checkResponseSuccess;

  this._getResponseErrorString = typeof params.getResponseErrorString === "function"
                         ? params.getResponseErrorString
                         : this.constructor.__getResponseErrorString;

  this._getResponseMessageString = typeof params.getResponseMessageString === "function" 
                                 ? params.getResponseMessageString
                                 : this.constructor.__getResponseMessageString;

  this._getResponseViewHtml = typeof params.getResponseViewHtml === "function"
                            ? params.getResponseViewHtml
                            : this.constructor.__getResponseViewHtml;

  this._generateAlertHtml = typeof params.generateAlertHtml === "function" 
                           ? params.generateAlertHtml
                           : this.constructor.__generateAlertHtml;

  this._getResponseCallbackUrl = typeof params.getResponseCallbackUrl === "function" 
                               ? params.getResponseCallbackUrl 
                               : this.constructor.__getResponseCallbackUrl;

  this._init();
}

// Default Values / Functions 

Emory.__attributePrefix = "emory-";
Emory.__initInterval = 5000;

Emory.__checkResponseSuccess = function (response) {
  if( typeof response !== "undefined" &&
      typeof response.success !== "undefined" ) {

    if( response.success === true ||
        response.success === 1 ||
        response.success === "1" ) {
      return true;
    }

  }

  return false;
}

Emory.__getResponseErrorString = function (response) {
  if( typeof response !== "undefined" &&
      typeof response.error !== "undefined" ) {
    return response.error;
  }

  return "";
}

Emory.__getResponseMessageString = function (response) {
  if( typeof response !== "undefined" &&
      typeof response.message !== "undefined" ) {
    return response.message;
  }

  return "";
}

Emory.__getResponseViewHtml = function (response, name) {
  if( typeof response !== "undefined" &&
      typeof response.data !== "undefined" &&
      typeof response.data.views !== "undefined" ) {

    if( typeof response.data.views[name] !== "undefined" ) {
      return response.data.views[name];
    }
  }

  return "";
}

Emory.__generateAlertHtml = function (message, type) {
  var _emory = this;

  var html = '';

  html += '<div ' + _emory._attributePrefix + 'alert="" data-alert="" class="alert-box ' + type + '">';
  html += message;
  html += '<a href="#" class="close">×</a>';
  html += '</div>';

  return html;
}

Emory.__getResponseCallbackUrl = function (response) {
  if( typeof response !== "undefined" &&
      typeof response.callback_url !== "undefined" ) {
    if( response.callback_url.length > 0 ) {
      return response.callback_url;
    }
  }

  return "";
}

// Couple data manipulation helpers

// Ensure that a string starts with pre and ends with post
Emory.prototype.__matchPattern = function (str, pre, post) {
  var _emory = this;

  if( str.indexOf(_emory._attributePrefix + pre) === 0 &&
      str.substr(str.length - post.length) === post )
    return true;

  return false;
}

// Remove find and replace with replace - this assumes the find exists at 
// the end of the string for efficiency.
Emory.prototype.__replacePostfix = function (str, find, replace) {
  return str.substr(0, str.length - find.length) + replace;
}

// Get a unique identifier surrounded by a pre and post.
Emory.prototype.__getKey = function (str, pre, post) {
  var _emory = this;

  prefixedPre = _emory._attributePrefix + pre;
  
  return str.substr(prefixedPre.length, str.length - prefixedPre.length - post.length);
}

// Binding Initialization

Emory.prototype._init = function () {
  var _emory = this;

  $(document).on(
    'click', 
    '[' + _emory._attributePrefix + 'click-submit]', 
    function (e) {
      e.preventDefault();
      _emory._handleFormSubmit($(this));
    }
  );

  $(document).on(
    'change', 
    '[' + _emory._attributePrefix + 'change-submit]', 
    function (e) {
      e.preventDefault();
      _emory._handleFormSubmit($(this));
    }
  );

  $(document).on(
    'keydown', 
    '[' + _emory._attributePrefix + 'enter-submit]', 
    function (e) {
      var code = e.keyCode || e.which;
      if( code == 13 ) {
        _emory._handleFormSubmit($(this));
        return false;
      }
    }
  );

  $(document).on(
    'valid.fndtn.abide', 
    '[' + _emory._attributePrefix + 'abide-submit]', 
    function (e) {
      _emory._handleFormSubmit($(this));
    }
  );

  // Listen for "emory-submit" on any "emory-ajax" or "emory-normal" form as well.
  $(document).on(
    _emory._attributePrefix + 'submit', 
    '[' + _emory._attributePrefix + 'ajax]', 
    function (e) {
      _emory._handleFormSubmit($(this));
    }
  );

  $(document).on(
    _emory._attributePrefix + 'submit', 
    '[' + _emory._attributePrefix + 'normal]', 
    function (e) {
      _emory._handleFormSubmit($(this));
    }
  );

  setInterval(function () {
    _emory._checkOnloadForms();
    _emory._checkTimeoutForms();
  }, _emory._initInterval);
}

Emory.prototype._checkOnloadForms = function () {
  var _emory = this;

  var $onloadForms = $('[' + _emory._attributePrefix + 'onload-submit]');

  $onloadForms.each(function (i, onloadForm) {
    $(onloadForm).removeAttr(_emory._attributePrefix + 'onload-submit');
    _emory._handleFormSubmit($(onloadForm));
  });
}

Emory.prototype._checkTimeoutForms = function () {
  var _emory = this;

  var $timeoutForms = $('[' + _emory._attributePrefix + 'timeout-submit]');

  $timeoutForms.each(function (i, timeoutForm) { 
    var submitTimeoutMS = $(timeoutForm).attr(_emory._attributePrefix + 'timeout-submit')
    $(timeoutForm).removeAttr(_emory._attributePrefix + 'timeout-submit');

    if( submitTimeoutMS.length === 0 ) {
      return;
    }

    var submitTimeoutID = '' + Math.floor(Math.random() * 999999999) + Date.now();

    $(timeoutForm).attr(_emory._attributePrefix + 'pending-timeout-submit', submitTimeoutID);

    setTimeout(function () {
      _emory._submitTimeoutForm(submitTimeoutID);
    }, parseFloat(submitTimeoutMS));
  });
}

Emory.prototype._submitTimeoutForm = function (submitTimeoutID) {
  var _emory = this;

  var $timeoutForm = $('[' + _emory._attributePrefix + 'pending-timeout-submit="'+submitTimeoutID+'"]');

  if( $timeoutForm.length === 0 ) {
    return;
  }

  $timeoutForm.removeAttr(_emory._attributePrefix + 'pending-timeout-submit');
  return _emory._handleFormSubmit($timeoutForm);
}

// Submission Handlers

// $initiator is either a form itself OR an element within a form.
Emory.prototype._handleFormSubmit = function ($initiator) {
  var _emory = this;

  // Get Form
  $form = $initiator.closest('form');

  if( $initiator.prop('tagName').toLowerCase() === "form" ) {
    $form = $initiator;
  }

  // Apply "emory-loading"
  if( $form.attr(_emory._attributePrefix + "loading-target") ) {
    $($form.attr(_emory._attributePrefix + "loading-target")).addClass(
      _emory._attributePrefix + "loading"
    );
  }
  
  // Apply input key / values
  $.each($initiator.get(0).attributes, function(i, attr){
    var key = attr.name;
    var value = attr.value;
    
    // Determine if this key matches the pattern for:
    // emory-submit-input-____-name
    if( _emory.__matchPattern(key, 'submit-input-', '-name') ) {
      var valueKey = _emory.__replacePostfix(key, '-name', '-value');

      // If the corresponding value-attribute exists, set the input with the 
      // name from the first attribute to be the value from the second attribute.
      if( typeof $initiator.attr(valueKey) !== "undefined" ) {
        $form
          .find('input[name="' + value + '"]')
          .val($initiator.attr(valueKey));
      }
    }
  });
  
  // Apply action to form.
  if( typeof $initiator.attr(_emory._attributePrefix + "submit-action") !== "undefined" ) {
    $form.attr('action', $initiator.attr(_emory._attributePrefix + "submit-action"));
  }
  
  // Determine Normal or Ajax submission.
  if( typeof $initiator.attr(_emory._attributePrefix + "submit-ajax") !== "undefined" ) {
    return _emory._submitFormAjax($form);
  }

  if( typeof $initiator.attr(_emory._attributePrefix + "submit-normal") !== "undefined" ) {
    return _emory._submitFormNormal($form);
  }

  if( typeof $form.attr(_emory._attributePrefix + "ajax") !== "undefined" ) {
    return _emory._submitFormAjax($form);
  }

  if( typeof $form.attr(_emory._attributePrefix + "normal") !== "undefined" ) {
    return _emory._submitFormNormal($form);
  }

  // No submission method defined, so we'll do nothing at all.
  return;
}

Emory.prototype._submitFormNormal = function ($form) {
  $form.submit();

  return;
}

Emory.prototype._submitFormAjax = function ($form) {
  var _emory = this;

  if( typeof $form.attr(_emory._attributePrefix + 'alert-target') !== "undefined" ) {
    _emory._removeAllAlerts($form, $($form.attr(_emory._attributePrefix + 'alert-target')));
  }

  if( $form.find('input[type="file"]').length ) {
    
    // If we don't support FormData we have to try to use the fallback.
    if( ! ("FormData" in window) ) {
      return _emory._submitFormAjaxFileFallback($form);
    }

    return _emory._submitFormAjaxFile($form);
  }

  var formData = {};

  $form.find('input:not([type="checkbox"]):not([type="radio"]), select, textarea').each(function () {
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
      return _emory._handleFormAjaxComplete($form, response);
    },
    error: function (response, message, error) {
      return _emory._handleFormAjaxFailure($form, message);
    }
  });
}

Emory.prototype._submitFormAjaxFile = function ($form) {
  var _emory = this;

  var formData = new FormData();
  formData.append('MAX_FILE_SIZE', '2000000000');

  $form.find('input:not([type="checkbox"]):not([type="radio"]):not([type="file"]), select, textarea').each(function () {
    formData.append($(this).attr('name'), $(this).val());
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
      return _emory._handleFormAjaxComplete($form, response);
    },
    error: function (response, message, error) {
      return _emory._handleFormAjaxFailure($form, message);
    }
  });
}

Emory.prototype._submitFormAjaxFileFallback = function ($form) {
  var _emory = this;

  // Handle by posting to an iFrame on the page.
  // This should only proc for IE9
  
  var formTargetName = _emory._attributePrefix + 'TARGET-' + Date.now();

  $formTarget = $('<iframe name="'+formTargetName+'" style="width: 1px; height: 1px; position: absolute; left: -100000px; top: 1px;"></iframe>');
  $('body').append($formTarget);
  
  $form.attr('target', formTargetName);
  
  $formTarget.load(function() {
    var content = "{}";

    if( $formTarget.contents().find('body').length ) {
      // If the content gets wrapped in HTML tags, then parse the JSON out of body.
      content = $formTarget.contents().find('body').get(0).innerHTML;
    } else {
      // Otherwise, just parse the entire contents of the document.
      var document = $formTarget.get(0).contentDocument;
      var serializer = new XMLSerializer();
      content = serializer.serializeToString(document);
    }

    $formTarget.remove();
    $form.removeAttr('target');

    _emory._handleFormAjaxComplete($form, JSON.parse(content))
  });

  $form.submit();
}

// // // // // // // // // // // // // // // // // // // 
// Chain of functions for handling an AJAX callback.  // 
// // // // // // // // // // // // // // // // // // // 

// This is called for request failures, not REST API errors.
Emory.prototype._handleFormAjaxFailure = function ($form, message) {
  var _emory = this;

  if( $form.attr(_emory._attributePrefix + "loading-target") ) {
    $($form.attr(_emory._attributePrefix + "loading-target")).removeClass(
      _emory._attributePrefix + "loading"
    );
  }

  return _emory._addAlert($form, message, 'error');
}

// // // // // // // // // // // // // // // // // // 
// Any request that completes successfully starts  // 
// here and chains the next dozen or so functions. // 
// // // // // // // // // // // // // // // // // // 

Emory.prototype._handleFormAjaxComplete = function ($form, response) {
  var _emory = this;

  var callback_url = _emory._getResponseCallbackUrl(response);

  if( callback_url.length > 0 ) {
    if( response.callback_url == window.location.href ) {
      window.location.reload(true);
    } else {
      window.location.href = response.callback_url;
    }

    return;
  }

  if( $form.attr(_emory._attributePrefix + "loading-target") ) {
    $($form.attr(_emory._attributePrefix + "loading-target")).removeClass(
      _emory._attributePrefix + "loading"
    );
  }

  if( ! _emory._checkResponseSuccess(response) ) {
    var error = _emory._getResponseErrorString(response);

    if( ! error.length ) {
      error = "An unknown error has occurred.";
    }

    return _emory._addAlert(
      $form, 
      error,
      'error'
    );
  }

  // Any views that are loaded in will be added to this queue
  // If they aren't show by another target, then they will automatically be 
  // shown right before `emory-ajax-callback`
  var $showTargets = $();

  return _emory._ajaxCompletePreviewHide($form, response, $showTargets);
}

// Preview Hide
Emory.prototype._ajaxCompletePreviewHide = function ($form, response, $showTargets) {
  var _emory = this;

  if( typeof $form.attr(_emory._attributePrefix + 'ajax-preview-hide-target') === "undefined" ) {
    return _emory._ajaxCompletePreviewShow($form, response, $showTargets);
  }

  return _emory._hideTarget(
    $form,
    $($form.attr(_emory._attributePrefix + 'ajax-preview-hide-target')),
    function () {
      _emory._ajaxCompletePreviewShow($form, response, $showTargets);
    }
  );
}

// Preview Show
Emory.prototype._ajaxCompletePreviewShow = function ($form, response, $showTargets) {
  var _emory = this;

  if( typeof $form.attr(_emory._attributePrefix + 'ajax-preview-show-target') === "undefined" ) {
    return _emory._ajaxCompleteViewReplace($form, response, $showTargets);
  }

  return _emory._showTarget(
    $form,
    $($form.attr(_emory._attributePrefix + 'ajax-preview-show-target')),
    function () {
      _emory._ajaxCompleteViewReplace($form, response, $showTargets);
    }
  );
}

// View Replace
// Handle all form attributes for "emory-ajax-view-NAME-replace-target"
Emory.prototype._ajaxCompleteViewReplace = function ($form, response, $showTargets) {
  var _emory = this;

  $.each($form.get(0).attributes, function(i, attr){
    var key = attr.name;
    var value = attr.value;

    if( _emory.__matchPattern(key, 'ajax-view-', '-replace-target') ) {
      var viewKey = _emory.__getKey(key, 'ajax-view-', '-replace-target');
      
      if( viewKey.length > 0 ) {
        var viewHtml = _emory._getResponseViewHtml(response, viewKey);

        if( viewHtml.length > 0 ) {
          $targets = $(value);

          // For each target, we want to create an HTML element and replace it.
          $targets.each(function (j, target) { 
            var $newHtml = $(viewHtml);
            $newHtml.css('display','none');
            $(target).after($newHtml);
            $(target).remove();

            $showTargets = $showTargets.add($newHtml);
          });
        }
      }
    }
  });

  return _emory._ajaxCompleteViewPrepend($form, response, $showTargets);
}

// View Prepend
Emory.prototype._ajaxCompleteViewPrepend = function ($form, response, $showTargets) {
  var _emory = this;

  $.each($form.get(0).attributes, function(i, attr){
    var key = attr.name;
    var value = attr.value;

    if( _emory.__matchPattern(key, 'ajax-view-', '-prepend-target') ) {
      var viewKey = _emory.__getKey(key, 'ajax-view-', '-prepend-target');
      
      if( viewKey.length > 0 ) {
        var viewHtml = _emory._getResponseViewHtml(response, viewKey);

        if( viewHtml.length > 0 ) {
          $targets = $(value);

          // For each target, we want to create an HTML element and prepend it.
          $targets.each(function (j, target) {
            var $newHtml = $(viewHtml);
            $newHtml.css('display','none');
            $(target).prepend($newHtml);

            $showTargets = $showTargets.add($newHtml);
          });
        }
      }
    }
  });

  return _emory._ajaxCompleteViewAppend($form, response, $showTargets);
}

// View Append
Emory.prototype._ajaxCompleteViewAppend = function ($form, response, $showTargets) {
  var _emory = this;

  $.each($form.get(0).attributes, function(i, attr){
    var key = attr.name;
    var value = attr.value;

    if( _emory.__matchPattern(key, 'ajax-view-', '-append-target') ) {
      var viewKey = _emory.__getKey(key, 'ajax-view-', '-append-target');
      
      if( viewKey.length > 0 ) {
        var viewHtml = _emory._getResponseViewHtml(response, viewKey);

        if( viewHtml.length > 0 ) {
          $targets = $(value);

          // For each target, we want to create an HTML element and prepend it.
          $targets.each(function (j, target) {
            var $newHtml = $(viewHtml);
            $newHtml.css('display','none');
            $(target).append($newHtml);

            $showTargets = $showTargets.add($newHtml);
          });
        }
      }
    }
  });

  return _emory._ajaxCompletePostviewHide($form, response, $showTargets);
}

// Postview Hide
Emory.prototype._ajaxCompletePostviewHide = function ($form, response, $showTargets) {
  var _emory = this;

  if( typeof $form.attr(_emory._attributePrefix + 'ajax-postview-hide-target') === "undefined" ) {
    return _emory._ajaxCompletePostviewShow($form, response, $showTargets);
  }

  return _emory._hideTarget(
    $form,
    $($form.attr(_emory._attributePrefix + 'ajax-postview-hide-target')),
    function () {
      _emory._ajaxCompletePostviewShow($form, response, $showTargets);
    }
  );
}

// Postview Show
Emory.prototype._ajaxCompletePostviewShow = function ($form, response, $showTargets) {
  var _emory = this;

  if( typeof $form.attr(_emory._attributePrefix + 'ajax-postview-show-target') === "undefined" ) {
    return _emory._ajaxCompleteShowTargets($form, response, $showTargets);
  }

  return _emory._showTarget(
    $form,
    $($form.attr(_emory._attributePrefix + 'ajax-postview-show-target')),
    function () {
      _emory._ajaxCompleteShowTargets($form, response, $showTargets);
    }
  );
}

// Show $showTargets
Emory.prototype._ajaxCompleteShowTargets = function ($form, response, $showTargets) {
  var _emory = this;

  $hiddenShowTargets = $showTargets.filter(':hidden');

  if( $hiddenShowTargets.length === 0 ) {
    return _emory._ajaxCompleteShowMessage($form, response);
  }

  return _emory._showTarget(
    $form,
    $hiddenShowTargets,
    function () {
      _emory._ajaxCompleteShowMessage($form, response);
    }
  );
}

// Show a message if the response included one.
Emory.prototype._ajaxCompleteShowMessage = function ($form, response) {
  var _emory = this;

  var message = _emory._getResponseMessageString(response);

  if( message.length === 0 ) {
    return _emory._ajaxCompleteCallback($form, response);
  }

  return _emory._addAlert(
    $form, 
    message,
    'success',
    function () {
      _emory._ajaxCompleteCallback($form, response)
    }
  );
}

// Callback
Emory.prototype._ajaxCompleteCallback = function ($form, response) {
  var _emory = this;

  if( typeof $form.attr(_emory._attributePrefix + 'ajax-callback') === "undefined" ) {
    return;
  }

  return window[$form.attr(_emory._attributePrefix + 'emory-ajax-callback')](response, $form);
}

// // // // // // // // // // // // // // // 
// Helper functions for DOM management.   // 
// // // // // // // // // // // // // // // 

Emory.prototype._showTarget = function($form, $target, callback) {
  var _emory = this;

  if( typeof callback !== "function" ) {
    callback = function () {};
  }

  var transition = "slide";

  if( typeof $form.attr(_emory._attributePrefix + 'ajax-transition') !== "undefined" ) {
    transition = $form.attr(_emory._attributePrefix + 'ajax-transition');
  }

  if( ! transition ||
      Array('slide','fade').indexOf(transition) < 0 ) {
    transition = 'slide';
  }

  if( transition == 'slide' ) {
    return $target.slideDown().promise().done(callback);
  }

  if( transition == 'fade' ) {
    return $target.fadeIn().promise().done(callback);
  }
}

Emory.prototype._hideTarget = function($form, $target, callback) {
  var _emory = this;

  if( typeof callback !== "function" ) {
    callback = function () {};
  }

  var transition = "slide";

  if( typeof $form.attr(_emory._attributePrefix + 'ajax-transition') !== "undefined" ) {
    transition = $form.attr(_emory._attributePrefix + 'ajax-transition');
  }

  if( ! transition ||
      Array('slide','fade').indexOf(transition) < 0 ) {
    transition = 'slide';
  }

  if( transition == 'slide' ) {
    return $target.slideUp().promise().done(callback);
  }

  if( transition == 'fade' ) {
    return $target.fadeOut().promise().done(callback);
  }
}

Emory.prototype._removeAllAlerts = function($form, $target) {
  var _emory = this;

  $alerts = $target.children('[' + _emory._attributePrefix + 'alert]');

  _emory._hideTarget(
    $form,
    $alerts,
    function() {
      $alerts.remove();
    }
  );
}

Emory.prototype._addAlert = function($form, message, type, callback) {
  var _emory = this;

  if( typeof callback !== "function" ) {
    callback = function () {};
  }

  if( typeof $form.attr(_emory._attributePrefix + 'alert-target') === "undefined" ) {
    return;
  }

  $target = $($form.attr(_emory._attributePrefix + 'alert-target'));

  $alert = $(_emory._generateAlertHtml(message, type));
  $alert.css('display','none');

  $target.prepend($alert);

  return _emory._showTarget($form, $alert, callback);
}