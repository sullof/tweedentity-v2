// eslint-disable-next-line node/no-missing-require
const {Badge} = require('react-bootstrap')

class LoadingBadge extends React.Component {

  render() {

    return (
      <span className="bitmr">{
        this.props.loading
          ? <img src="img/spinner.svg" width="20" style={{marginRight: 2}}/>
          : <Badge bsClass={this.props.bsClass}>{this.props.text}</Badge>
      }</span>
    )
  }

}

module.exports = LoadingBadge
