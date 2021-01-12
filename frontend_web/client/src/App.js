import React, { Component } from 'react';
// css files
import './index.css';
// helpers
import { api } from './ApiManager';

class App extends Component {

  state = {
    isLoading: false,
    isFetch: false,
    pathArray: [],
    contents: {},
  }

  componentDidMount = () => {
    // 1. Fetch the relative path from url
    // 1.1 filter out the empty string
    // 1.2 empty array by default
    // 1.3 home as root directory
    let pathArray = window.location.pathname.split('/').filter(item => item !== '') || [];
    pathArray.unshift('home');
    this.setState({
      isLoading: true,
      pathArray
    })
  }

  componentDidUpdate = (prevProps, prevState) => {
    if (prevState.pathArray.length !== this.state.pathArray.length) {
      let updatePath = this.state.pathArray.join('/');
      this.handleFetch(updatePath);
    }
  }

  handleFetch = async (pathArr) => {
    const response = await api('route', `path=${pathArr}`);
    const {
      Data: {
        Confirmation,
        Response,
      }
    } = response;
    if (Confirmation === 'SUCCESS') {
      this.setState({
        isLoading: false,
        isFetch: true,
        contents: Response.Data.children
      })
    }
  }

  handleAddPath = (path) => {
    let pathArray = JSON.parse(JSON.stringify(this.state.pathArray));
    pathArray.push(path);
    this.setState({
      pathArray
    })
  }

  handleNavigatePath = (index) => {
    let pathArray = JSON.parse(JSON.stringify(this.state.pathArray));
    pathArray.splice(index + 1);
    this.setState({
      pathArray
    })
  }

  render() {
    const {
      mainContainerStyle,
      mainWrapperStyle,
      loadingContainerStyle,
      loadingStyle
    } = styles;
    return (
      <div style={mainContainerStyle}>
        <div style={mainWrapperStyle}>
          {
            this.state.isLoading && (
              <div style={loadingContainerStyle}><p style={loadingStyle}>Loading..</p></div>
            )
          }
          {
            this.state.isFetch && (
              <>
                <Tabs
                  tabs={this.state.pathArray}
                  handleNavigatePath={(index) => this.handleNavigatePath(index)}
                />
                <Contents
                  tabs={this.state.pathArray}
                  contents={this.state.contents}
                  handleAddPath={(path) => this.handleAddPath(path)}
                />
              </>
            )
          }
        </div>
      </div>
    );
  }
}

class Tabs extends Component {
  render() {
    const {
      tabMainContainerStyle,
      tabMainWrapperStyle,
      tabTxtStyle,
      tabIconStyle,
    } = styles;
    const {
      tabs,
    } = this.props;
    return (
      <div style={tabMainContainerStyle}>
        {
          tabs.map((item, index) => {
            const isLastItem = index === tabs.length - 1;
            return (
              <div
                key={index}
                style={Object.assign({}, tabMainWrapperStyle, {
                  cursor: isLastItem ? 'default' : 'pointer'
                })}
                onClick={() => isLastItem ? {} : this.props.handleNavigatePath(index)}
              >
                <p style={Object.assign({}, tabTxtStyle, {
                  color: isLastItem ? '#000' : 'blue'
                })}>
                  {item || "Tab_Title"}
                  {
                    !isLastItem && (
                      <span style={tabIconStyle}>{`›`}</span>
                    )
                  }
                </p>
              </div>
            )
          })
        }
      </div>
    )
  }
}

class Contents extends Component {

  state = {
    isViewFile: false,
    file: null
  }

  componentDidUpdate(prevProps, prevState) {
    if (prevProps.tabs.length !== this.props.tabs.length) {
      this.setState({
        isViewFile: false,
        file: null
      })
    }
  }

  handleViewFile = (file) => {
    this.setState({
      isViewFile: !this.state.isViewFile,
      file
    })
  }

  render() {
    const {
      contentMainContainerStyle,
      fileViewContainerStyle,
      fileViewCloseContainerStyle,
      fileViewCloseStyle,
      fileContainerStyle,
      fileStyle,
      fileTxtStyle,
      folderContainerStyle,
      folderStyle,
      folderTxtStyle,
    } = styles;
    const {
      contents
    } = this.props;
    return (
      <div style={contentMainContainerStyle}>
        {
          this.state.isViewFile
            ?
            <div style={fileViewContainerStyle}>
              <div
                style={fileViewCloseContainerStyle}
                onClick={() => this.handleViewFile(null)}
              >
                <p style={fileViewCloseStyle}>&times;</p>
              </div>
              <p>THIS IS FILE: {this.state.file}</p>
            </div>
            :
            Object.keys(contents).map((item, index) => {
              let type = contents[item].type || "file";
              return (
                <div
                  key={index}
                >
                  {
                    type === 'file' ?
                      <div
                        style={fileContainerStyle}
                        onClick={() => this.handleViewFile(item)}
                      >
                        <p style={fileStyle}>{`📄`}</p>
                        <p style={fileTxtStyle}>{item}</p>
                      </div>
                      :
                      <div
                        style={folderContainerStyle}
                        onClick={() => this.props.handleAddPath(item)}
                      >
                        <p style={folderStyle}>{`📁`}</p>
                        <p style={folderTxtStyle}>{item}</p>
                      </div>
                  }
                </div>
              )
            })
        }
      </div>
    )
  }
}

const styles = {
  // main
  mainContainerStyle: {
    position: 'relative',
    width: '100vw',
    height: '100vh'
  },
  mainWrapperStyle: {
    paddingLeft: 24,
    paddingRight: 24
  },
  loadingContainerStyle: {
    position: 'absolute',
    top: 0,
    left: 0,
    zIndex: 1,
    height: '100%',
    width: '100%',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)'
  },
  loadingStyle: {
    color: '#FFF'
  },

  // tabs
  tabMainContainerStyle: {
    marginTop: 18,
    marginBottom: 60
  },
  tabMainWrapperStyle: {
    display: 'inline-block',
    marginRight: 12,
  },
  tabTxtStyle: {
    textTransform: 'capitalize',
  },
  tabIconStyle: {
    paddingLeft: 9,
    color: 'grey'
  },

  // contents
  contentMainContainerStyle: {
    display: 'flex',
    flexDirection: 'row'
  },
  fileViewContainerStyle: {
    width: '100%',
    height: 60,
    position: 'relative',
    display: 'flex',
    alignItems: 'center'
  },
  fileViewCloseContainerStyle: {
    position: 'absolute',
    right: '-9px',
    top: '-9px',
    zIndex: 1,
    height: 18,
    width: 18,
  },
  fileViewCloseStyle: {
    fontSize: 24,
    cursor: 'pointer'
  },
  fileContainerStyle: {
    width: 60,
    height: 60,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    cursor: 'pointer',
    marginRight: 12,
    flexDirection: 'column'
  },
  fileStyle: {
    fontSize: 48
  },
  fileTxtStyle: {
    fontSize: 12,
    textAlign: 'center'
  },
  folderContainerStyle: {
    width: 60,
    height: 60,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    cursor: 'pointer',
    marginRight: 12,
    flexDirection: 'column'
  },
  folderStyle: {
    fontSize: 48
  },
  folderTxtStyle: {
    fontSize: 12,
    textAlign: 'center'
  }
}

export default App;
