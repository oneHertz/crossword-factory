import React from 'react'
import copy from 'copy-text-to-clipboard'

const ShareModal = (props) => {
    const inputEl = React.useRef()

    const onCopy = (e) => {
      e.preventDefault();
      copy(props.url);
      inputEl.current.focus()
      inputEl.current.setSelectionRange(0, props.url.length)
    }

    return (
      <div className="modal" role="dialog" style={{display: 'block', zIndex: 1e19}}>
        <div className="modal-dialog">
          <div className="modal-content">
            <div className="modal-header" style={{padding:'35px 50px'}}>
              <h4>Partager</h4>
              <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close" onClick={props.onClose}></button>
            </div>
            <div className="modal-body" style={{padding:'40px 50px'}}>
              <form>
                <div className="form-row align-items-center">
                  <div className="col-auto">
                    <label htmlFor="url" className="sr-only"><i className="fas fa-link"></i> URL</label>
                    <input ref={inputEl} type="text" className="form-control" id="url" name="url" placeholder="URL" readOnly value={props.url}/>
                  </div>
                  <div className="col-auto">
                    <button data-testid="copyBtn" className="btn btn-primary" onClick={onCopy}><i className="fas fa-copy"></i> Copier</button>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    )
  }
  
  export default ShareModal