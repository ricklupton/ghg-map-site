/* global ENV, location */

import { expandableSankeyDiagram } from 'd3-expandable-sankey'
import { select, json, format } from 'd3'

import { setupIntro } from './intro.js'

import './styles.css'

let log = console.log

// The logger should only be disabled if we’re not in production.
if (ENV !== 'production') {
  // Enable LiveReload
  document.write(
    '<script src="http://' + (location.host || 'localhost').split(':')[0] +
      ':35729/livereload.js?snipver=1"></' + 'script>'
  )
} else {
  // Disable debugging
  log = function () {}
}

var SCALE = 8e-9
var diagram = expandableSankeyDiagram()
    .scale(SCALE)
    .on('clickNode', setDetails)

log('loading...')

json('data/sankey_data.json')
  .then(function (data) {
    log('got data!')
    log(data)
    data['groups'] = data['metadata']['groups']

    // diagram.groups(data['metadata']['groups'])

    diagram(select('svg').datum(data))
    setupIntro()
  })
  .catch(function (error) {
    throw (error)
  })

var numberFormat0 = format('.1f')

function numberFormat (x) {
  return numberFormat0(x / 1e9) + ' Gt'
}

function setDetails (d) {
  var details = select('#details')
  details.select('h1').text(d.title)
    .append('small').text(numberFormat(d.value))
  details.select('p').text(d.description)

  details.select('tbody')
    .selectAll('tr')
    .remove()

  var rows = details.select('tbody')
      .selectAll('tr')
      .data(d.subdivisions)
      .enter()
      .append('tr')

  rows.append('td').text(function (d) { return d.label })
  rows.append('td').text(function (d) { return numberFormat(d.value) })
  rows.append('td').text(function (d) { return d.description })
}
