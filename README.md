# emory.js
A pattern and engine for easily handling AJAX form submissions.

Emory - As in Emory Erickson.

http://en.memory-alpha.org/wiki/Emory_Erickson

##Default Bindings

All Emory functions are bound to attributes that start with "emory-" by default.
This namespace can be replaced within the init() function with whatever prefix 
you prefer.

##Initialization

Only initialize Emory once.  You can pass the following to override defaults.

- **attributePrefix** : String prefix for all attributes, default is "emory-".
- **checkResponseSuccess** : `function (response)` : Should return true or false depending on response.
	- Used to strictly check if a request was successful.  If not, Emory will attempt to present the error message from getResponseErrorString.
- **getResponseErrorString** : `function (response)` : Should return a plaintext string of an error if one occurred.
	- This should return an empty string if there is no error.
- **getResponseMessageString** : `function (response)` : Should return a plaintext string of a message if one was received.
	- This should return an empty string if there is no message.
- **getResponseViewHtml** : `function (response, name)` : Should return the HTML for a view with key "name".
- **getResponseCallbackUrl** : `function (response)` : Should return a URL to redirect to if present in response, "" otherwise.
- **generateAlertHtml** : `function (text, type)` : Should return HTML for an alert message.
	- Types can be "error" and "success".  
	- Wrapper element must have attribute "emory-alert"

##Form Attributes

**Basics**

- `emory-normal` : Send the form via browser request.
- `emory-ajax` : Send the form via AJAX
	- This will invoke all of the emory-ajax-* events below if applicable.
- `emory-loading-target` : jQuery selector to apply the "emory-loading" class to during form processing.
	- Note: "emory-loading" will be replaced with your own attributePrefix if provided.
- `emory-alert-target` : jQuery selector to prepend alerts into.
- `emory-ajax-transition` : How to transition hiding and showing elements.  "slide" ( Default ) or "fade"

**DOM Management**

Emory AJAX requests are most powerful when loading in new views, replacing old ones, etc.
The following attributes dictate what content should be hidden, created, and shown 
after every successful AJAX request.  Each of these attributes are listed in the 
specific order that they are handled - and each fires after the animations from 
the previous step are complete.

There are four steps of a successful AJAX request:

**preview** - Before any views are manipulated

- `emory-ajax-preview-hide-target` : A jQuery selector to hide.
- `emory-ajax-preview-show-target` : A jQuery selector to show.

**view** - These target specific views and load them into the DOM. The "NAME" 
keyword should be replaced with the specific identifier you are expecting to 
have returned within your JSON.  These will be set to `display: none;` by 
default.

- `emory-ajax-view-NAME-replace-target` : A jQuery selector to replace with the view.
- `emory-ajax-view-NAME-prepend-target` : A jQuery selector to prepend the view to.
- `emory-ajax-view-NAME-append-target` : A jQuery selector to append the view to.

Emory will automatically show any views that are not properly shown / hidden in 
`emory-ajax-postview-show-target` to make implementing Emory easier.  However, 
if you want more granular control, you can add the `emory-ajax-view-noautoshow` 
attribute to not automatically show those views.  You can listen to one of the 
listed trigger events below, or use the event in `emory-ajax-callback` to show 
the elements however you wish.

**postview** - After views have been loaded into the DOM.

- `emory-ajax-postview-hide-target` : A jQuery selector to hide.
- `emory-ajax-postview-show-target` : A jQuery selector to show.

**callback** - After all view related events, we can fire a Javascript callback.

- `emory-ajax-callback` : `function (response, $form)` : A global function to be called.

##Form Submission

**Events**

These events should be placed on elements such as buttons, links, and input boxes.

- `emory-click-submit` : Submit when this element is clicked.
- `emory-enter-submit` : Submit when this element receives the enter key.
- `emory-change-submit` : Submit when the value of this element has changed ( input only ).
- `emory-abide-submit` : Submit when this element receives the "valid.fndtn.abide" event from Abide.

There are two events that can be placed on forms themselves:

- `emory-onload-submit` : If present, submit the form as soon as it is loaded.
- `emory-timeout-submit` : If present, time ( in milliseconds ) until form should be submitted.


**Event Modifiers**

Emory has multiple ways to submit a form, including on form load, timeouts, 
click and enter listeners, and more.  Any of these can have the following attributes 
to affect the form just before it submits:

- `emory-submit-ajax` : Submit the form via AJAX.
- `emory-submit-normal` : Submit the form via normal browser request.
- `emory-submit-action` : The URL the form should submit to.
- `emory-submit-input-name` : The name of an input to change before submission.
- `emory-submit-input-value` : The value to change the previously specified input to.

You can also specify multiple input name / value pairs by prepending a binding 
key before `-name` and `-value`.  i.e. `emory-submit-input-ABCDE-name` and 
`emory-submit-input-ABCDE-value` .

These can be added either to forms themselves ( i.e. if using 
`emory-onload-submit` ), or to links and fields that are bound using 
`emory-click-submit` or `emory-enter-submit`.

##Triggered Events

Every time an AJAX submission successfully completes, the following events are 
triggered ON the elements themselves:

- `emory-view-loaded` - When an element is loaded and placed into the DOM.
- `emory-view-shown` - When an emory-triggered process shows an element in the DOM.
- `emory-view-hidden` - When an emory-triggered process hides an element in the DOM.

