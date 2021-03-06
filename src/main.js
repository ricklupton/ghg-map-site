/* global ENV, location */

import { expandableSankeyDiagram } from 'd3-expandable-sankey'
import { select, event, json, format } from 'd3'

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

const svg = select('svg')
const width = svg.attr('width')
svg.on('click', selectNothing)

json('data/sankey_data.json')
  .then(function (data) {
    log('got data!')
    log(data)
    data['groups'] = data['metadata']['groups']

    // diagram.groups(data['metadata']['groups'])

    diagram(select('svg').datum(data))

    // Add custom regions
    select('svg').append('rect')
      .attr('id', 'group-mobility-to-transport')
      .attr('x', 0)
      .attr('y', 0)
      .attr('width', 230)
      .attr('height', 450)
      .style('fill', 'none')
    select('svg').append('rect')
      .attr('id', 'group-transport')
      .attr('x', 0)
      .attr('y', 0)
      .attr('width', 430)
      .attr('height', 150)
      .style('fill', 'none')
    select('svg').append('rect')
      .attr('id', 'group-equipment-to-device')
      .attr('x', 270)
      .attr('y', 0)
      .attr('width', 430)
      .attr('height', 350)
      .style('fill', 'none')

    const tour = setupIntro()
  })
  .catch(function (error) {
    console.error(error)
  })

var numberFormat0 = format('.1f')

function numberFormat (x) {
  return numberFormat0(x / 1e9) + ' Gt'
}

function setDetails (d) {
  event.stopPropagation()
  var details = select('#details')
  details.select('h1').text(d.title)
    .append('small').text(numberFormat(d.value))
  details.select('p').text(d.description)

  details.select('ul')
    .selectAll('li')
    .remove()

  var rows = details.select('ul')
      .selectAll('li')
      .data(d.subdivisions)
      .enter()
      .append('li')

  rows.append('h2')
    .text(function (d) { return d.label })
    .append('small')
    .text(function (d) { return numberFormat(d.value) })
  rows.append('div').text(function (d) { return d.description })

  // details.style('transform', 'translateX(-370px)')
  if (d.x0 > width / 2) {
    details.classed('show-left', true)
    details.classed('show-right', false)
  } else {
    details.classed('show-right', true)
    details.classed('show-left', false)
  }
}

function selectNothing () {
  console.log('northing')
  var details = select('#details')

  details.select('h1').text('')
  details.select('p').text('Click on the diagram labels for a more detailed view.')

  details.select('ul')
    .selectAll('li')
    .remove()

  details.classed('show-right', false)
  details.classed('show-left', false)
  // select('#details').style('transform', '')
}
