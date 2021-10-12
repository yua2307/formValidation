// object validator
function Validator(options) {
  var selectorRules = {};
  // function validate
  function validate(inputElement, rule) {
    var errorElement = inputElement.parentElement.querySelector(
      options.errorSelector
    );
    var errorMessage;
    // get these reules from selector
    var rules = selectorRules[rule.selector];
    // loop for each rule of selector & check
    // if have error , then stopped and render error message

    for (var i = 0; i < rules.length; i++) {
      errorMessage = rules[i](inputElement.value);
      if (errorMessage) break;
    }

    if (errorMessage) {
      errorElement.innerText = errorMessage;
      inputElement.parentElement.classList.add("invalid");
    } else {
      errorElement.innerText = "";
      inputElement.parentElement.classList.remove("invalid");
    }

    return errorMessage ? false : true;
  }

  // take element's form need to validate
  var formElement = document.querySelector(options.form);
  if (formElement) {
    // listen onsubmit form

    formElement.onsubmit = function (e) {
      e.preventDefault();

      var isFormValid = true;
      options.rules.forEach(function (rule) {
        // Loop through each rules and validate form
        var inputElement = formElement.querySelector(rule.selector);
        var isValid = validate(inputElement, rule);
        if (!isValid) {
          isFormValid = false;
        }
      });

      if (isFormValid) {
        // Case submit with JS
        if (typeof options.onSubmit === "function") {
          var enableInputs = formElement.querySelectorAll(
            "[name]:not([disabled])"
          );
          var formValues = Array.from(enableInputs).reduce((values, input) => {
            values[input.name] = input.value;
            return values;
          }, {});
          options.onSubmit(formValues);
        }
        // Case submit with default options
        else {
          formElement.submit();
        }
      }
    };

    // loop through each role and handle it
    options.rules.forEach(function (rule) {
      // save each rule for each input
      if (Array.isArray(selectorRules[rule.selector])) {
        selectorRules[rule.selector].push(rule.test);
      } else {
        selectorRules[rule.selector] = [rule.test];
      }
      var inputElement = formElement.querySelector(rule.selector);

      if (inputElement) {
        // handle case user blur out of input line
        inputElement.onblur = function () {
          validate(inputElement, rule);
        };

        // handle case when user start typing
        inputElement.oninput = () => {
          var errorElement = inputElement.parentElement.querySelector(
            options.errorSelector
          );
          inputElement.parentElement.classList.remove("invalid");
          errorElement.innerText = "";
        };
      }
    });
  }
}

// Define rules
// rule : when have error =>  return error message
// rule : when not have error => return nothing (undefined)
Validator.isRequired = function (selector, message) {
  return {
    selector: selector,
    test: function (value) {
      return value.trim("")
        ? undefined
        : message || `Please enter this field !!!`;
    },
  };
};
Validator.isEmail = function (selector, message) {
  return {
    selector: selector,
    test: function (value, message) {
      var regrex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
      return regrex.test(value)
        ? undefined
        : message || "Please enter right format email  !!!";
    },
  };
};
Validator.minLength = function (selector, minLength, message) {
  return {
    selector: selector,
    test: function (value) {
      return value.length >= minLength
        ? undefined
        : message ||
            `Please enter password's length at least ${minLength} char`;
    },
  };
};
Validator.isConfirmed = function (selector, getConfirmPassword, message) {
  return {
    selector: selector,
    test: function (value) {
      return value == getConfirmPassword()
        ? undefined
        : message || "Please enter right password confirmation";
    },
  };
};
