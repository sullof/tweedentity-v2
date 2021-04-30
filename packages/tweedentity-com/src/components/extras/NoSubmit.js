// eslint-disable-next-line node/no-missing-require
const {Button} = require('react-bootstrap')

class NoSubmit extends React.Component {

  render() {

    return (
      <Button
        type="submit"
        style={{display: 'none'}}
        onClick={e => {
          e.preventDefault()
        }}>Set</Button>
    )
  }

}

module.exports = NoSubmit
