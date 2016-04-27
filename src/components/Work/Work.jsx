import React, { Component } from 'react'
import Relay from 'react-relay'
import { Col, Row } from 'react-bootstrap'
import s from './Work.scss'
import RepoList from './RepoList/RepoList.jsx'
import HeaderImage from '../Misc/HeaderImage/HeaderImage.jsx'

class Work extends Component {
	constructor(props) {
	  super(props)
	}

  render() {
    return (
      <div id="work">

        <HeaderImage
          name="work"
          title="Projects"
          caption="Where Impact is Made"
          position="right"
        />

	      {/* Work Content Section */}
	      <section className={classNames('container', s.contentSection)}>
          <Row>
            <h1>Work</h1>
            <p>Please view Alex's <a href={my.github.url} className={s.projMainClr}>Github</a> or go to the <strong className={s.projMainClr}>projects</strong> portion of his <a href="https://www.linkedin.com/in/alexcory" className={s.projMainClr}>LinkedIn</a> located just after his work experience section.  Although not all of his projects are on Github or LinkedIn, at least you can see some of the projects he has worked on.</p>
          </Row>
          <RepoList viewer={this.props.viewer} />
	      </section>

      </div>
    );
  }
}

export default Relay.createContainer(Work, {
  fragments: {
    viewer: () => Relay.QL`
      fragment on User {
      	${RepoList.getFragment('viewer')}
      }
    `,
  },
});