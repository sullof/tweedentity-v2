// eslint-disable-next-line node/no-missing-require
const React = require('react')
// eslint-disable-next-line node/no-missing-require
const ReactDOM = require('react-dom')

const App = require('./App')

it('renders without crashing', () => {
  const div = document.createElement('div')
  ReactDOM.render(<App />, div)
  ReactDOM.unmountComponentAtNode(div)
})
