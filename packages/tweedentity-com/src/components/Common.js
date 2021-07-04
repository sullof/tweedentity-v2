const ls = require('local-storage')

// eslint-disable-next-line no-undef
module.exports = class Common extends React.Component {

  constructor(props) {
    super(props)

    this.bindMany = this.bindMany.bind(this)
    this.ls = ls
  }

  bindMany(methods) {
    for (let m of methods) {
      this[m] = this[m].bind(this)
    }
  }

  render() {
    return <div/>
  }
}

