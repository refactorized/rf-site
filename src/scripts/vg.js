/*global _, $ */
$(function () {
  var period = 5000 // ms
  var thickness = 0.2
  var stripes = [
    {color: '#227', dist: 1},
    {color: '#fa3', dist: 2},
    {color: '#227', dist: 3},
    {color: '#af3', dist: 4},
    {color: '#227', dist: 5},
    {color: '#3af', dist: 6}
  ]

  var xRatio = 0
  // var yRatio = 0

  // function sinTime () {
  //   return Math.sin((Date.now() % period) / period * 2 * Math.PI)
  // }

  function cosTime () {
    return Math.cos((Date.now() % period) / period * 2 * Math.PI)
  }
  var shadTemp = _.template('${x}em ${y}em 0 ${color}')

  function drawShadows (xm, ym) { // m for magnitude (-1...1)
    var css = _(stripes)
      .map(function (s) {
        return (shadTemp({
          x: xm * s.dist * thickness * -1,
          y: ym * s.dist * thickness,
          color: s.color
        }))
      })
      .join(',')
    $('header').css('text-shadow', css)
  }
var a = 0;
  function draw () {
    // drawShadows(sinTime(), cosTime())
    drawShadows(xRatio * 2 - 1, cosTime())
  }

  $('body').on('mousemove', function (e) {
    xRatio = (e.pageX - $(this).offset().left) / $(this).width() || 0.5
    // yRatio = (e.pageY - $(this).offset().top) / $(this).height()
  })

  window.setInterval(draw, 80)

  $('body').trigger('mousemove')
})
