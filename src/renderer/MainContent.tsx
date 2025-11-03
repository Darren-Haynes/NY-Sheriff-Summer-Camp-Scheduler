import CampSign from "../../assets/its-all-about-the-kids.png";

export default function MainContent() {
  return (
    <main>
      <div className="bg-image">
        <div className="overlay">
          <div id="input-section">
            <div id="raft"></div>
            <div id="input-box">
              <p>Upload a spreadsheet</p>

              <button type="button" id="upload-btn" className="btn-margin">
                Upload
              </button>
              <p>or paste sheet content</p>
              <button
                type="button"
                id="paste-btn"
                className="paste-btn-txt btn-margin"
              >
                Paste Sheet
              </button>
              <button type="button" id="close-btn" className="btn-margin">
                Close
              </button>

              <div id="camp-sign">
                <img width="400" alt="icon" src={CampSign} />
              </div>
            </div>
            <div className="break"></div>
          </div>
        </div>
      </div>
    </main>
  );
}
