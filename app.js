//EQUATION ARRAY
let equationArr = ['keq'];
let keqValue, productsArr, reactantsArr;
let resultsDiv = document.getElementById('x-values');

//EQUATION BUILDER OBJECT
let builder = {
  add: () => {
    //Get the equation div
    let equationDiv = document.getElementById('equation-div');

    //Create a wrapper div for the newly created element
    let wrapperDiv = document.createElement('div');

    //Give the wrapper an id based on order the element comes in
    wrapperDiv.id = `${equationArr.length}`;
    wrapperDiv.className = 'element-div';

    //Create the three boxes inside that stores: 
    //Coefficient, symbol, state
    let coefficientInput = document.createElement('input');
    coefficientInput.type = 'number';
    coefficientInput.placeholder = 'Coefficient';

    let symbolInput = document.createElement('input');
    symbolInput.type = 'text';
    symbolInput.placeholder = 'Element Symbol'

    //State Drop Down Menu
    let stateInput = document.createElement('select');

    //Options
    let solid = document.createElement('option');
    solid.innerHTML = 's';
    let liquid = document.createElement('option');
    liquid.innerHTML = 'l';
    let gas = document.createElement('option');
    gas.innerHTML = 'g';
    let aqueous = document.createElement('option');
    aqueous.innerHTML = 'aq';

    let stateArr = [solid, liquid, gas, aqueous];
    for(let state of stateArr){
      stateInput.appendChild(state);
    }

    //Initial Concentration input 
    let concentrationInput = document.createElement('input');
    concentrationInput.type = 'number';
    concentrationInput.placeholder = 'Initial concentration mol/L'

    //Insert all the inputs into the wrapper div
    let inputArr = [stateInput, coefficientInput, symbolInput, concentrationInput];
    for (let input of inputArr){
      wrapperDiv.appendChild(input);
    }

    //Insert the wrapper div into the builder div
    equationDiv.appendChild(wrapperDiv);
    equationArr.push([]);
  }, 
  keq: () => {
    let equationDiv = document.getElementById('equation-div');
    let keqSymbol = document.createElement('h1');

    keqSymbol.id = `${equationArr.length}`;
    keqSymbol.innerHTML = '⇌';

    if(equationArr.length !== 1 && !equationArr.includes('⇌')){
      equationDiv.appendChild(keqSymbol);
      equationArr.push('⇌');
    }
  },
  delete: () => {
    let equationDiv = document.getElementById('equation-div');
    let deleted = document.getElementById(`${equationArr.length - 1}`);

    if(equationArr.length >= 1){
      equationDiv.removeChild(deleted);
      equationArr.pop();
    }
  },
  save: () => {
    for (let i = 1; i < equationArr.length; i++) {
      let element = document.getElementById(`${i}`);
      if(element.innerHTML !== '⇌'){
        equationArr[i] = [];
        if(element.childNodes[0].value !== 's' && element.childNodes[0].value !== 'l'){
          equationArr[i].push(parseFloat(element.childNodes[3].value));
          equationArr[i].push(parseFloat(element.childNodes[1].value));
        }
      }
    }

    //FURTHER ORGANIZATION OF EQUATION ARRAY
    keqValue = equationArr[0];
    reactantsArr = equationArr.slice(1, equationArr.indexOf('⇌'));
    productsArr = equationArr.slice(equationArr.indexOf('⇌')+1);

    console.log(equationArr);
  },
  saveKeq: () => {
    let keqVal = document.getElementById('keq-input-field');
    
    equationArr[0] = parseFloat(keqVal.value);
    console.log(equationArr);

    //FURTHER ORGANIZATION OF EQUATION ARRAY
    keqValue = equationArr[0];
    reactantsArr = equationArr.slice(1, equationArr.indexOf('⇌'));
    productsArr = equationArr.slice(equationArr.indexOf('⇌')+1);

    let reactantDegree = 0; 
    let productDegree = 0;

    for (let element of reactantsArr){
      reactantDegree += element[1];
    }

    for (let element of productsArr) {
      productDegree += element[1];
    }

    if (reactantDegree > 2 || productDegree > 2){
      alert('your equation is too powerful, check your keq value or coefficents!');
    }else{
      let calculateBtn = document.getElementById('calculate-btn');
      calculateBtn.disabled = false; 
    }
  }
}

function resetDiv () {
  document.getElementById('equation-div').reset();
  document.getElementById('keq-div').reset();
  resultsDiv.innerHTML = '';
}

//HELPER FUNCTIONS

//Approximation Rule returns true or false
function approximation (reactants) {
  let smallestConcentration = 0;

  for(let element of reactants){  
    if(element[0] < smallestConcentration || smallestConcentration === 0){
      smallestConcentration = element[0];
    }
  } 

  return smallestConcentration/keqValue > 1000;
}

//Binomial Expansion Function
function binomialExpansion (element){
  //first parse from the element values that are needed
  let A = element[0];
  let coeff = -element[1], n = element[1];

  function factorial (n){
    let f = 1;
    for( let i = 2; i <= n; i++){
      f*=i;
    }
    return f;
  }

  //calc n! 
  let nFact = factorial(n);
  let elementArr = [];

  for(let i = 0; i < n+1; i++){
    let niFact = factorial(n-i);
    let iFact = factorial(i);

    let aPow = Math.pow(A, n - i);
    let xPow = Math.pow(coeff, i);

    elementArr.unshift([(nFact*aPow*xPow)/(niFact*iFact), i]);
  }

  return elementArr; 
}

//monomial expansion function
function monomialExpansion (element){
  //retrieve the coefficient 
  let coeff = element[1];
  let elementArr = [];
  let monomial = [];

  monomial.push(Math.pow(coeff, coeff));
  monomial.push(coeff);
  elementArr.push(monomial);

  return elementArr;
}

function constantExpansion(element) {
  let coeff = element[1];
  let result = Math.pow(element[0], coeff);

  return result; 
}

function multiplyPolynomials (element1, element2){
  //Global Variables 
  let combinedArr = [];
  const leadExp = element1[0][1] + element2[0][1];
  const termsInE2 = element2.length;

  //Multiply the terms
  for (let t1 of element1){
    for(let t2 of element2) {
      //The current term 
      let current = [t1[0]*t2[0], t1[1]+t2[1]];
      let len = combinedArr.length;

      //first populate combinedArr with the the first t1 
      //multiplied by all the t2s
      if(len < termsInE2){
        combinedArr.push(current);
      }else{
        let expDiff = leadExp - current[1];
        if(expDiff <= len-1){
          combinedArr[expDiff][0] = combinedArr[expDiff][0]+current[0];
        }else{
          combinedArr.push(current);
        }
      }
    }
  }
  return combinedArr;
}

function quadraticFormula (a, b, c) {
  let posX = (-b + Math.sqrt(Math.pow(b, 2) - 4*a*c))/(2*a)
  let negX = (-b - Math.sqrt(Math.pow(b, 2) - 4*a*c))/(2*a)

  return [posX.toFixed(3), negX.toFixed(3)]; 
}

function calculateX (){
    //first Check the approx rule 
    let approxCheck = approximation(reactantsArr);

    if(approxCheck === true) {
    let bottom = 1; 
      //First constantExpand the shit
      for(let element of reactantsArr){
        bottom = bottom*constantExpansion(element);
      }
      let constant = bottom*keqValue;

      //Expand the top
      let top = monomialExpansion(productsArr[0]);
      for(let i = 1; i < productsArr.length; i++){
        let current = [productsArr[i]];
        top = multiplyPolynomials(top, current);
      }

      //isolate x 
      constant = constant/top[0][0];
      constant = Math.pow(constant, 1/top[0][1]);
      let displayDiv = document.createElement('div');
      let innerValue = document.createTextNode(constant);
      displayDiv.appendChild(innerValue);
      displayDiv.className = 'x';
      resultsDiv.appendChild(displayDiv);
    }else{
    let bottom = binomialExpansion(reactantsArr[0]); 
    let count = 0; 
    let count2 = 0; 
    
    //Expand reactants 
    for(let element of reactantsArr){
      if (count !== 0){
        bottom = multiplyPolynomials(bottom, binomialExpansion(element));
      }
      count++;
    }

    //Expand the products
    let top = monomialExpansion(productsArr[0]);
    for(let element of productsArr){
      if (count2 !== 0){
        top = multiplyPolynomials(top, monomialExpansion(element));
      }
      count2++;
    }

    //multiply bottom by the keq value
    for(let term of bottom){
      term[0] = term[0]*keqValue; 
    }

    //subtract top from bottom
    let index = bottom[0][1] - top[0][1];
    if (index < 0){
      top[0][0] = -top[0][0];
      bottom.unshift(top[0]);
    }else{
      bottom[index][0] -= top[0][0];
    }

    //return quadratic formula results
    let xArray = quadraticFormula(bottom[0][0], bottom[1][0], bottom[2][0]);
    for(let x of xArray){
      if(x > 0){
        let displayDiv = document.createElement('div');
        let innerValue = document.createTextNode(x);
        displayDiv.appendChild(innerValue);
        displayDiv.className = 'x';
        resultsDiv.appendChild(displayDiv);
      }
    }
    }
  return;
}