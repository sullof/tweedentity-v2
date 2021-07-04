const Base = require('./Base')
const LoadingButton = require('./extras/LoadingButton')

// eslint-disable-next-line node/no-missing-require
const {Card} = require('react-bootstrap')

class Account extends Base {


  constructor(props) {
    super(props)

  }

  render() {

    const data = this.db.data

    let content = <p>Coming soon...</p>

    if (this.props.active) {

      if (data.userId) {

        const idData = <p style={{paddingTop: 8}}>
          <span className="code">{this.appName()} ID: {data.userId}<br/>
          {/*TID: {this.appId(this.props.webApp)}/{this.appUid(data, this.props.webApp)} */}
          </span>
        </p>

        content = <span>
            <p>
              <img style={{borderRadius: 100}} src={data.avatar} width="120" height="120"/>
            </p>
            <p className="user-data">
              {data.name}<br/>
              <a rel="noreferrer" href=""
                // this.config.profileOnApp[this.props.webApp](data.username)
                 target="_blank">{
                   // this.config.decoration[this.props.webApp]}{data.username
                 }</a>
            </p>
          {idData}
          </span>
      } else if (this.props.profile) {
        content = <span>
          <p>
              <i style={{fontSize: 120, color: '#E9F7FA'}} className="fas fa-user-circle" />
            </p>
        <p className="user-data">
        Tweedentity not set, yet
        </p>
      </span>
      } else {
        content = <span>
          <p>{
            <i style={{fontSize: 120, color: '#E9F7FA'}} className="fas fa-user-circle" />
          }
            </p>
        <p className="user-data">
        Ready to set your tweedentity?
        </p>
        <p>
          <LoadingButton
            text="Yes, please"
            loadingText="Analyzing wallet"
            loading={this.Store.loading && this.loading}
            disabled={this.Store.ready === 0 || (this.Store.loading && !this.loading)}
            cmd={() => {
              this.loading = true
              this.props.getStats()
            }}
          />
        </p>
      </span>
      }
    }
    return (
      <Card>
        <Card.Body>
          <div className="account">
            <i className={`fab fa-${this.props.icon} appIcon`} />
            {
              this.Store.ready === 1
              && this.props.active
              && data.userId
              && !this.props.noSettings
              ? <i className="fa fa-cog settingsIcon command" onClick={() => {
                // this.setGlobalState({appNickname: this.props.webApp})
                // this.historyPush('manage-account')
              }} />
              : null
            }
            {content}
          </div>
        </Card.Body>
      </Card>
    )

  }
}

module.exports = Account
