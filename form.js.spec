##Form Handler

__<form>__
- emory-form-ajax
- emory-form-result-target / Default to FORM parent?
- emory-form-loading-target / Default to FORM parent?
- emory-form-transition / Default to "slide" - can also be "fade"

- emory-form-onload-submit / Boolean to submit as soon as loaded.
- emory-form-timeout-submit / Time in milliseconds to wait before auto submitting
- emory-form-timeout-submit-action / Action to submit to on timeout
- emory-form-timeout-submit-input-name / Input to change value of on timeout submit
- emory-form-timeout-submit-input-value / Value to change input to on timeout submit

- emory-form-ajax-success-pre-hide-target -> An ID to slideUp after a successful response.
- emory-form-ajax-success-pre-show-target -> An ID to slideDown after a successful response.
- emory-form-ajax-success-post-hide-target -> An ID to slideUp after replacing the form.
- emory-form-ajax-success-post-show-target -> An ID to slideDown after replacing the form.
- emory-form-ajax-success-callback -> A javascript function to run.

// The following are not implemented yet.
- emory-form-ajax-error-pre-show-target -> An ID to slideUp after a failed response.
- emory-form-ajax-error-pre-show-target -> An ID to slideDown after a failed response.
- emory-form-ajax-error-post-hide-target -> An ID to slideUp after failed response adds an alert.
- emory-form-ajax-error-post-show-target -> An ID to slideDown after failed response adds an alert.
- emory-form-ajax-error-callback -> A javascript function to run.

For response.data.views we require:

- emory-form-ajax-success-view-VIEW-replace-target -> Replaces the selector with the new view.
- emory-form-ajax-success-view-VIEW-prepend-target -> Prepends the new view to the selector.
- emory-form-ajax-success-view-VIEW-append-target -> Appends the new view to the selector.

__<input>__ or __<a>__
- emory-form-enter-submit
- emory-form-click-submit
- emory-form-change-submit
- emory-form-submit-action
- emory-form-submit-fallback-action
- emory-form-submit-input-name
- emory-form-submit-input-value


