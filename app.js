
// Budget Controller.
var budgetController = (function () {

  var Expense = function (id, description, value) {
    this.id = id;
    this.description = description;
    this.value = value;
    this.percentage = -1;
  };

  Expense.prototype.calcPercentage = function(totalIncome) {
    if (totalIncome > 0) {
      this.percentage = Math.round(this.value/totalIncome*100);
    } else {
      this.percentage = -1;
    }
  };

  Expense.prototype.getPercentage = function() {
    return this.percentage;
  };

  var Income = function (id, description, value) {
    this.id = id;
    this.description = description;
    this.value = value;
  };

  var calculateTotal = function (type) {
    var sum = 0;
    data.allItems[type].forEach((item) => {
      sum += item.value;
    });

    data.totals[type] = sum;
  }

  var data = {
    allItems : {
      exp : [],
      inc : []
    },
    totals : {
      exp : 0,
      inc : 0
    },
     budget : 0,
     percentage : -1
  };

  return {

    addItem : function(type, des, val) {

      var newItem, ID;

      // Create new id.
      if (data.allItems[type].length > 0) {
        ID = data.allItems[type][data.allItems[type].length - 1].id + 1;
      } else {
        ID = 0;
      }


      // Create newItem based on inc or exp.
      if (type === 'exp') {
        newItem = new Expense (ID, des, val);
      } else if (type === 'inc') {
        newItem = new Income (ID, des, val);
      }

      // Push newItem into the allItems array based on inc or exp.
      data.allItems[type].push (newItem);

      // Return the newItem.
      return newItem;
    },

    deleteItem: function(type, id) {
      var ids;

      ids = data.allItems[type].map(current => {
        return current.id;
      });

      index = ids.indexOf(id);

      if (index !== -1) {
        data.allItems[type].splice(index,1);
      }
    },

    calculateBudget : function() {
      // Calculate total Income and Expense.
      calculateTotal('inc');
      calculateTotal('exp');
      // Calculate the budget.
      data.budget = data.totals.inc - data.totals.exp;
      // Calculate the percentages.
      if (data.totals.inc > 0) {
        data.percentage = Math.round(data.totals.exp/data.totals.inc*100);
      } else {
        data.percentage = -1;
      }


    },

    calculatePercentage: function() {
      data.allItems.exp.forEach((item, i) => {
        item.calcPercentage(data.totals.inc);
      });
    },

    getPercentage: function() {
      var allPerc = data.allItems.exp.map(item => {
        return item.getPercentage();
      });
      return allPerc;
    },

    getBudget : function() {
      return {
        budget: data.budget,
        totalIncome: data.totals.inc,
        totalExpense: data.totals.exp,
        percentage: data.percentage
      }
    },

    testing : function () {
      console.log (data);
    }
  };


}) ();


// UI Controller.
var uiController = (function () {

  var formatNumber = function(num, type) {

    num = Math.abs(num);
    num = num.toFixed(2);

    numSplit = num.split('.');

    integer = numSplit[0];
    decimal = numSplit[1];

    if (integer.length > 3) {
      integer = integer.substr(0, integer.length - 3) + ',' + integer.substr(integer.length - 3, integer.length);
    }

    return (type === 'inc' ? '+ ' : '- ') + integer + '.' + decimal;
  };

  var domStrings = {
    inputType: '.add__type',
    inputDescription: '.add__description',
    inputValue: '.add__value',
    inputBtn: '.add__btn',
    incomeContainer: '.income__list',
    expenseContainer: '.expenses__list',
    budgetIncome: '.budget__income--value',
    budgetExpense: '.budget__expenses--value',
    percentage: '.budget__expenses--percentage',
    budget: '.budget__value',
    container: '.container',
    expensePerc: '.item__percentage',
    month:'.budget__title--month'
  };

  var nodeListForEach = function(list, callback) {
    for (var i = 0; i < list.length; i++) {
      callback(list[i], i);
    }
  };


  return {
    getInput: function () {

      return {
        type : document.querySelector (domStrings.inputType).value,
        description : document.querySelector (domStrings.inputDescription).value,
        value : parseFloat(document.querySelector (domStrings.inputValue).value)
      };
    },

    addListItem: function (obj, type) {

      var html, newHtml, element;

      //Create HTML string with placeholder text.
      if (type === 'inc') {
        element = domStrings.incomeContainer;
        html = '<div class="item clearfix" id="inc-%id%"> <div class="item__description">%description%</div> <div class="right clearfix"> <div class="item__value">%value%</div> <div class="item__delete"> <button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button> </div> </div> </div>';
      } else if (type === 'exp') {
        element = domStrings.expenseContainer;
        html = '<div class="item clearfix" id="exp-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__percentage">21%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>'
      }

      //Replace the placeholder text with some actual data.
      newHtml = html.replace ('%id%', obj.id);
      newHtml = newHtml.replace ('%description%', obj.description);
      newHtml = newHtml.replace ('%value%', formatNumber(obj.value, type));

      //Insert the HTML into the dom.

      document.querySelector(element).insertAdjacentHTML('beforeend',newHtml);

    },

    clearFields: function () {
      var fields, fieldsArr;

      fields = document.querySelectorAll(domStrings.inputDescription + ',' + domStrings.inputValue);
      fieldsArr = Array.prototype.slice.call(fields);

      fieldsArr.forEach((item) => {
        item.value = "";
      });

      fieldsArr[0].focus();

    },

    displayBudget: function(obj) {
      var type;
      obj.budget > 0 ? type = 'inc' : type = 'exp';
      document.querySelector(domStrings.budget).textContent = formatNumber(obj.budget, type);
      document.querySelector(domStrings.budgetIncome).textContent = formatNumber(obj.totalIncome,'inc');
      document.querySelector(domStrings.budgetExpense).textContent = formatNumber(obj.totalExpense,'exp');
      if (obj.percentage > 0) {
        document.querySelector(domStrings.percentage).textContent = obj.percentage + ' %';
      } else {
        document.querySelector(domStrings.percentage).textContent = '--';
      }

    },

    deleteListItem: function(selectorId) {
      //console.log(selectorId);
      var ele = document.querySelector('#' + selectorId);
      ele.parentNode.removeChild(ele);
    },

    displayPercentages: function(percentages) {
      var fields = document.querySelectorAll(domStrings.expensePerc);

      nodeListForEach(fields, function(current, index) {
        if (percentages[index] > 0) {
          current.textContent = percentages[index] + '%';
        } else {
          current.textContent = '--';
        }
      });
    },

    displayMonth: function() {
      var year, months = [], month;
      months = ['Jan','Feb','March','April','May','June','July','Aug','Sep','Nov','Dec'];
      year = new Date().getFullYear();
      month = new Date().getMonth();
      document.querySelector(domStrings.month).textContent = months[month] + ' ' + year;
    },

    changedType: function() {
      var fields = document.querySelectorAll(domStrings.inputType + ',' + domStrings.inputDescription + ',' + domStrings.inputValue);
      nodeListForEach(fields, function(curr){
        curr.classList.toggle('red-focus');
      });
    },

    getDomStrings: function () {
      return domStrings;
    }
  };

}) ();


// Global controller.
var controller = (function (budgetCtrl, uiCtrl) {

  var setupEventListeners = function() {

    var DOM = uiCtrl.getDomStrings();

    document.querySelector(DOM.inputBtn).addEventListener('click', cltrAddItem);

    document.addEventListener('keypress', function (event) {
      if (event.charCode === 13) {
        cltrAddItem ();
      }
    });

    document.querySelector(DOM.container).addEventListener('click', cltrDeleteItem);

    document.querySelector(DOM.inputType).addEventListener('change', uiCtrl.changedType);
  };

  var updateBudget = function() {
    // 1. Calculate the budget.
    budgetCtrl.calculateBudget();
    // 2. Return the budget.
    var budget = budgetCtrl.getBudget();
    // 3. Display the budget on the UI.
    uiCtrl.displayBudget(budget);



  };

  var updatePercentage = function() {
    // 1. Cal percentage.
    budgetCtrl.calculatePercentage();

    // 2. Read percentages from the budget controller.
    var perc = budgetCtrl.getPercentage();

    // 3. Update the UI with the new percentage.
    uiCtrl.displayPercentages(perc);


  };

  var cltrAddItem = function() {
    //1. Get the field input data.
    //2. Add the item to the budget controller.
    //3. Add the item to the UI.
    //4. Clear the Fields.
    //5. Calculate and Display the budget on the UI.

    var input, newItem;
    //1. Get the field input data.
    input = uiCtrl.getInput();

    if (input.description !== "" && !isNaN(input.value) && input.value > 0){
      //2. Add the item to the budget controller.
      newItem = budgetCtrl.addItem (input.type, input.description, input.value);


      //3. Add the item to the budget controller.
      uiCtrl.addListItem (newItem, input.type);

      //4. Clear the fields.
      uiCtrl.clearFields();

      //5. Calculate and Display the budget on the UI.
      updateBudget();

      //6. Cal and update the percentage.
      updatePercentage();
    }

  };

  var cltrDeleteItem = function(event) {
    var itemID, splitID, type, ID;

    itemID = event.target.parentNode.parentNode.parentNode.parentNode.id;

    if (itemID) {
      splitID = itemID.split('-');
      type = splitID[0];
      ID = parseInt(splitID[1]);
    }

    // 1. Delete the item from the data-structure.
    budgetCtrl.deleteItem(type,ID);

    // 2. Delete the item from UI.
    uiCtrl.deleteListItem(itemID);

    // 3. Update the Global budget.
    updateBudget();


  };

  return {
    init : function () {
      console.log('Program has started');

      uiCtrl.displayMonth();
      setupEventListeners ();
      uiCtrl.displayBudget({
        budget: 0,
        totalIncome: 0,
        totalExpense: 0,
        percentage: 0
      });
    }
  };
}) (budgetController, uiController);

controller.init();
