import d3 from 'd3';
import topojson from 'topojson';

const svg = d3.select('.map-container')
  .append('svg')
  .attr({
    height: 600,
    width: 600
  });

const projection = d3.geo.mercator();
projection.center([40, 8]);
projection.scale(420);

const path = d3.geo.path().projection(projection);

const defaultCountryColor = '#ddd';
const defaultBorderColor = '#fff';
const wrongCountryColor = '#f66';
const correctCountryColor = '#6f6';

let currentlyAnswering = true;
let countryToFind;
let correctAttempts = 0;
let totalAttempts = 0;
const countriesAlreadySelected = [];

d3.json('data/africaTopo.json', (err, data) => {
  const countries = topojson.feature(data, data.objects.africa);
  svg.selectAll('path.country')
    .data(countries.features)
    .enter()
    .append('path')
    .classed('country', true)
    .attr('data-name', d => d.properties.name)
    .attr('d', path)
    .attr('fill', defaultCountryColor)
    .attr('stroke', defaultBorderColor)
    .attr('stroke-width', '1')
    .on('click', d => {
      if (currentlyAnswering) attemptAnswer(d);
    })
    .on('mouseover', function(d){
      d3.select(this).style('opacity', 0.5);
    })
    .on('mouseout', function(d){
      d3.select(this).style('opacity', 1);
    });

  function selectRandArrElem(arr){
    const i = Math.floor(Math.random() * arr.length);
    return arr[i];
  }

  function selectRandCountry(){
    return selectRandArrElem(countries.features);
  }

  function selectNewRandCountry() {
    let i = 0;

    while (true) {
      const maybeNewCountry = selectRandCountry();
      const isNewCountry = true;
      countriesAlreadySelected.forEach( country => {
        if (maybeNewCountry === country) isNewCountry = false;
      });
      if (isNewCountry) {
        countriesAlreadySelected.push(maybeNewCountry);
        return maybeNewCountry;
      }

      // infinite loop prevention
      i++;
      if (i > 1000) break;
    }
  }

  function loadNewQuestion(){
    currentlyAnswering = true;

    d3.selectAll('path.country').attr('fill', defaultCountryColor);
    d3.select('.quiz-check-or-x').html('');
    d3.select('.quiz-attempt').html('');

    countryToFind = selectNewRandCountry();
    d3.select('.quiz-question').html(countryToFind.properties.name)
  }

  function attemptAnswer(selectedCountry){
    totalAttempts++;

    if (selectedCountry === countryToFind) {
      d3.select('.quiz-check-or-x').html('✓').style('color', 'green');
      d3.select('.quiz-attempt').html(selectedCountry.properties.name).style('color', 'green');
      d3.select(countryToSelector(countryToFind)).attr('fill', correctCountryColor);
      correctAttempts++;
    }
    else {
      d3.select('.quiz-check-or-x').html('✘').style('color', 'red');
      d3.select('.quiz-attempt').html(selectedCountry.properties.name).style('color', 'red');
      d3.select(countryToSelector(selectedCountry)).attr('fill', wrongCountryColor);
      d3.select(countryToSelector(countryToFind)).attr('fill', correctCountryColor);
    }

    d3.select('.correct-attempts').html(correctAttempts);
    d3.select('.total-attempts').html(totalAttempts);

    currentlyAnswering = false;

    setTimeout(_ => {
      loadNewQuestion();
    }, 1000);
  }

  function countryToSelector(country){
    return `[data-name="${country.properties.name}"]`;
  }

  loadNewQuestion()

});
