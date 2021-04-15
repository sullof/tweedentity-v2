import Base from './Base'
import {Player} from 'video-react'

export default class VideoPlayer extends Base {

  render() {
    return (
      <Player>
        <source src={this.props.src}/>
      </Player>

    )
  }
}
