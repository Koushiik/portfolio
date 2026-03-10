import { useEffect } from 'react'
import { initAdmin } from './adminLegacy'

function AdminApp() {
  useEffect(() => {
    initAdmin()
  }, [])

  return (
    <>
      <main className="admin-shell">
        <header className="admin-header">
          <p className="admin-kicker">Portfolio CMS</p>
          <h1>Admin Panel</h1>
          <p>Sign in to edit public portfolio content and publish updates for all visitors.</p>
        </header>

        <section className="admin-card">
          <form id="login-form" className="admin-form login-form">
            <label className="field">
              <span>Admin Password</span>
              <input id="admin-password" name="password" type="password" required autoComplete="off" />
            </label>
            <div className="admin-actions">
              <button type="submit" className="btn-primary">Sign In</button>
              <a href="index.html" className="btn-link">Open Website</a>
            </div>
          </form>

          <div id="editor-nav" className="editor-nav is-hidden" aria-label="Admin editor switch">
            <button type="button" id="open-general-editor" className="editor-nav-btn is-active">Portfolio Content</button>
            <button type="button" id="open-blog-editor" className="editor-nav-btn">Blog Management</button>
          </div>

          <form id="admin-form" className="admin-form is-hidden">
            <p className="form-copy">Use the sections below to edit portfolio content quickly.</p>

            <details className="editor-section">
              <summary>Hero & About</summary>
              <div className="form-grid">
                <label className="field">
                  <span>Full Name</span>
                  <input id="heroName" name="heroName" type="text" required />
                </label>
                <label className="field">
                  <span>Headline</span>
                  <input id="heroSubtitle" name="heroSubtitle" type="text" required />
                </label>
                <label className="field field--full">
                  <span>Hero Intro Text</span>
                  <textarea id="heroText" name="heroText" rows={3} required></textarea>
                </label>
                <label className="field">
                  <span>Hero Button: Primary</span>
                  <input id="heroPrimaryButtonLabel" name="heroPrimaryButtonLabel" type="text" required />
                </label>
                <label className="field">
                  <span>Hero Button: Secondary</span>
                  <input id="heroSecondaryButtonLabel" name="heroSecondaryButtonLabel" type="text" required />
                </label>
                <label className="field field--full">
                  <span>Hero Button: Resume</span>
                  <input id="heroResumeButtonLabel" name="heroResumeButtonLabel" type="text" required />
                </label>
                <label className="field field--full">
                  <span>About Title</span>
                  <input id="aboutTitle" name="aboutTitle" type="text" required />
                </label>
                <label className="field field--full">
                  <span>About Paragraph 1</span>
                  <textarea id="aboutParagraph1" name="aboutParagraph1" rows={4} required></textarea>
                </label>
                <label className="field field--full">
                  <span>About Paragraph 2</span>
                  <textarea id="aboutParagraph2" name="aboutParagraph2" rows={4} required></textarea>
                </label>
              </div>
            </details>

            <details className="editor-section">
              <summary>Skills</summary>
              <div className="form-grid">
                <label className="field field--full">
                  <span>Skills Title</span>
                  <input id="skillsTitle" name="skillsTitle" type="text" required />
                </label>
                <label className="field">
                  <span>Skills Card 1 Title</span>
                  <input id="skillsCard1Title" name="skillsCard1Title" type="text" required />
                </label>
                <label className="field field--full">
                  <span>Skills Card 1 Items (One per line)</span>
                  <textarea id="skillsCard1Items" name="skillsCard1Items" rows={4} required></textarea>
                </label>
                <label className="field">
                  <span>Skills Card 2 Title</span>
                  <input id="skillsCard2Title" name="skillsCard2Title" type="text" required />
                </label>
                <label className="field field--full">
                  <span>Skills Card 2 Items (One per line)</span>
                  <textarea id="skillsCard2Items" name="skillsCard2Items" rows={4} required></textarea>
                </label>
                <label className="field">
                  <span>Skills Card 3 Title</span>
                  <input id="skillsCard3Title" name="skillsCard3Title" type="text" required />
                </label>
                <label className="field field--full">
                  <span>Skills Card 3 Items (One per line)</span>
                  <textarea id="skillsCard3Items" name="skillsCard3Items" rows={4} required></textarea>
                </label>
                <label className="field">
                  <span>Skills Card 4 Title</span>
                  <input id="skillsCard4Title" name="skillsCard4Title" type="text" required />
                </label>
                <label className="field field--full">
                  <span>Skills Card 4 Items (One per line)</span>
                  <textarea id="skillsCard4Items" name="skillsCard4Items" rows={4} required></textarea>
                </label>
              </div>
            </details>

            <details className="editor-section">
              <summary>Experience</summary>
              <div className="form-grid">
                <label className="field field--full">
                  <span>Experience Title</span>
                  <input id="experienceTitle" name="experienceTitle" type="text" required />
                </label>
                <label className="field">
                  <span>Experience Item 1 Title</span>
                  <input id="experienceItem1Title" name="experienceItem1Title" type="text" required />
                </label>
                <label className="field">
                  <span>Experience Item 1 Meta</span>
                  <input id="experienceItem1Meta" name="experienceItem1Meta" type="text" required />
                </label>
                <label className="field field--full">
                  <span>Experience Item 1 Bullets (One per line)</span>
                  <textarea id="experienceItem1Bullets" name="experienceItem1Bullets" rows={4} required></textarea>
                </label>
                <label className="field">
                  <span>Experience Item 2 Title</span>
                  <input id="experienceItem2Title" name="experienceItem2Title" type="text" required />
                </label>
                <label className="field">
                  <span>Experience Item 2 Meta</span>
                  <input id="experienceItem2Meta" name="experienceItem2Meta" type="text" required />
                </label>
                <label className="field field--full">
                  <span>Experience Item 2 Bullets (One per line)</span>
                  <textarea id="experienceItem2Bullets" name="experienceItem2Bullets" rows={4} required></textarea>
                </label>
                <label className="field">
                  <span>Experience Item 3 Title</span>
                  <input id="experienceItem3Title" name="experienceItem3Title" type="text" required />
                </label>
                <label className="field">
                  <span>Experience Item 3 Meta</span>
                  <input id="experienceItem3Meta" name="experienceItem3Meta" type="text" required />
                </label>
                <label className="field field--full">
                  <span>Experience Item 3 Bullets (One per line)</span>
                  <textarea id="experienceItem3Bullets" name="experienceItem3Bullets" rows={4} required></textarea>
                </label>
              </div>
            </details>

            <details className="editor-section">
              <summary>Projects</summary>
              <div className="form-grid">
                <label className="field field--full">
                  <span>Projects Title</span>
                  <input id="projectsTitle" name="projectsTitle" type="text" required />
                </label>
                <label className="field">
                  <span>Project 1 Title</span>
                  <input id="project1Title" name="project1Title" type="text" required />
                </label>
                <label className="field field--full">
                  <span>Project 1 Description</span>
                  <textarea id="project1Description" name="project1Description" rows={3} required></textarea>
                </label>
                <label className="field">
                  <span>Project 2 Title</span>
                  <input id="project2Title" name="project2Title" type="text" required />
                </label>
                <label className="field field--full">
                  <span>Project 2 Description</span>
                  <textarea id="project2Description" name="project2Description" rows={3} required></textarea>
                </label>
                <label className="field">
                  <span>Project 3 Title</span>
                  <input id="project3Title" name="project3Title" type="text" required />
                </label>
                <label className="field field--full">
                  <span>Project 3 Description</span>
                  <textarea id="project3Description" name="project3Description" rows={3} required></textarea>
                </label>
              </div>
            </details>

            <details className="editor-section">
              <summary>Contact, Education & Footer</summary>
              <div className="form-grid">
                <label className="field">
                  <span>Phone Number</span>
                  <input id="phoneNumber" name="phoneNumber" type="text" required />
                </label>
                <label className="field">
                  <span>Email</span>
                  <input id="email" name="email" type="email" required />
                </label>
                <label className="field field--full">
                  <span>LinkedIn URL</span>
                  <input id="linkedinUrl" name="linkedinUrl" type="url" required />
                </label>
                <label className="field field--full">
                  <span>Education Title</span>
                  <input id="educationTitle" name="educationTitle" type="text" required />
                </label>
                <label className="field">
                  <span>Education Degree</span>
                  <input id="educationDegree" name="educationDegree" type="text" required />
                </label>
                <label className="field">
                  <span>Institution and Years</span>
                  <input id="educationInstitutionYears" name="educationInstitutionYears" type="text" required />
                </label>
                <label className="field field--full">
                  <span>Contact Section Title</span>
                  <input id="contactTitle" name="contactTitle" type="text" required />
                </label>
                <label className="field field--full">
                  <span>Footer Name</span>
                  <input id="footerName" name="footerName" type="text" required />
                </label>
              </div>
            </details>

            <div className="editor-footer">
              <label className="field field--full">
                <span>Commit Message (Optional)</span>
                <input
                  id="commitMessage"
                  name="commitMessage"
                  type="text"
                  maxLength={140}
                  className="commit-input"
                  placeholder="Example: update hero headline and contact email"
                />
              </label>

              <div className="admin-actions admin-actions--editor">
                <button type="button" id="preview-website" className="btn-link">Preview Website</button>
                <button type="submit" className="btn-primary">Save Changes</button>
                <button type="button" id="logout" className="btn-secondary">Log Out</button>
              </div>
            </div>
          </form>

          <form id="blog-form" className="admin-form is-hidden">
            <h3 className="form-heading">Blog Management</h3>
            <p className="form-copy">Use the dropdown sections below to edit each blog post.</p>

            <div className="form-grid blog-config-grid">
              <label className="field field--full">
                <span>Blog Section Title</span>
                <input id="blogTitle" name="blogTitle" type="text" required />
              </label>
            </div>

            <details className="editor-section blog-editor-section" data-blog-panel="1">
              <summary id="blog1SectionSummary">Blog Post 1</summary>
              <div className="blog-panel-meta">
                <p className="blog-panel-stats">
                  <span id="blog1BodyWords">0</span> words · <span id="blog1BodyChars">0</span> chars
                </p>
                <button type="button" className="btn-secondary" data-preview-blog-index="1">Preview Popup</button>
              </div>
              <div className="form-grid">
                <label className="field">
                  <span>Title</span>
                  <input id="blog1Title" name="blog1Title" type="text" required />
                </label>

                <label className="field">
                  <span>URL</span>
                  <input id="blog1Url" name="blog1Url" type="text" required />
                </label>

                <label className="field field--full">
                  <span>Card Description</span>
                  <textarea id="blog1Description" name="blog1Description" rows={4} required></textarea>
                </label>

                <label className="field field--full">
                  <span>Full Draft (Popup Content)</span>
                  <div className="blog-editor">
                    <div className="blog-editor-toolbar">
                      <button type="button" data-editor-action="paragraph" title="Normal paragraph">
                        <span className="tool-glyph">¶</span>
                        <span className="tool-label">Normal</span>
                      </button>
                      <button type="button" data-editor-action="heading" title="Heading 2">
                        <span className="tool-glyph">H2</span>
                        <span className="tool-label">Heading</span>
                      </button>
                      <button type="button" data-editor-action="bold" title="Bold (Ctrl/Cmd+B)">
                        <span className="tool-glyph">B</span>
                        <span className="tool-label">Bold</span>
                      </button>
                      <button type="button" data-editor-action="italic" title="Italic (Ctrl/Cmd+I)">
                        <span className="tool-glyph">I</span>
                        <span className="tool-label">Italic</span>
                      </button>
                      <button type="button" data-editor-action="underline" title="Underline (Ctrl/Cmd+U)">
                        <span className="tool-glyph">U</span>
                        <span className="tool-label">Underline</span>
                      </button>
                      <button type="button" data-editor-action="bullet" title="Bullet list (Ctrl/Cmd+Shift+8)">
                        <span className="tool-glyph">•</span>
                        <span className="tool-label">Bullet</span>
                      </button>
                      <button type="button" data-editor-action="numbered" title="Numbered list (Ctrl/Cmd+Shift+7)">
                        <span className="tool-glyph">1.</span>
                        <span className="tool-label">Numbered</span>
                      </button>
                      <button type="button" data-editor-action="link" title="Insert link (Ctrl/Cmd+K)">
                        <span className="tool-glyph">🔗</span>
                        <span className="tool-label">Link</span>
                      </button>
                      <button type="button" data-editor-action="linebreak" title="New paragraph">
                        <span className="tool-glyph">↵</span>
                        <span className="tool-label">Paragraph</span>
                      </button>
                      <button type="button" data-editor-action="undo" title="Undo (Ctrl/Cmd+Z)">
                        <span className="tool-glyph">↶</span>
                        <span className="tool-label">Undo</span>
                      </button>
                      <button type="button" data-editor-action="redo" title="Redo (Ctrl/Cmd+Y)">
                        <span className="tool-glyph">↷</span>
                        <span className="tool-label">Redo</span>
                      </button>
                    </div>
                    <div
                      id="blog1BodyEditor"
                      className="blog-editor-surface"
                      data-editor-source="blog1Body"
                      contentEditable
                      suppressContentEditableWarning
                    ></div>
                    <textarea id="blog1Body" name="blog1Body" rows={10} className="blog-editor-source is-hidden"></textarea>
                  </div>
                </label>
              </div>
            </details>

            <details className="editor-section blog-editor-section" data-blog-panel="2">
              <summary id="blog2SectionSummary">Blog Post 2</summary>
              <div className="blog-panel-meta">
                <p className="blog-panel-stats">
                  <span id="blog2BodyWords">0</span> words · <span id="blog2BodyChars">0</span> chars
                </p>
                <button type="button" className="btn-secondary" data-preview-blog-index="2">Preview Popup</button>
              </div>
              <div className="form-grid">
                <label className="field">
                  <span>Title</span>
                  <input id="blog2Title" name="blog2Title" type="text" required />
                </label>

                <label className="field">
                  <span>URL</span>
                  <input id="blog2Url" name="blog2Url" type="text" required />
                </label>

                <label className="field field--full">
                  <span>Card Description</span>
                  <textarea id="blog2Description" name="blog2Description" rows={4} required></textarea>
                </label>

                <label className="field field--full">
                  <span>Full Draft (Popup Content)</span>
                  <div className="blog-editor">
                    <div className="blog-editor-toolbar">
                      <button type="button" data-editor-action="paragraph" title="Normal paragraph">
                        <span className="tool-glyph">¶</span>
                        <span className="tool-label">Normal</span>
                      </button>
                      <button type="button" data-editor-action="heading" title="Heading 2">
                        <span className="tool-glyph">H2</span>
                        <span className="tool-label">Heading</span>
                      </button>
                      <button type="button" data-editor-action="bold" title="Bold (Ctrl/Cmd+B)">
                        <span className="tool-glyph">B</span>
                        <span className="tool-label">Bold</span>
                      </button>
                      <button type="button" data-editor-action="italic" title="Italic (Ctrl/Cmd+I)">
                        <span className="tool-glyph">I</span>
                        <span className="tool-label">Italic</span>
                      </button>
                      <button type="button" data-editor-action="underline" title="Underline (Ctrl/Cmd+U)">
                        <span className="tool-glyph">U</span>
                        <span className="tool-label">Underline</span>
                      </button>
                      <button type="button" data-editor-action="bullet" title="Bullet list (Ctrl/Cmd+Shift+8)">
                        <span className="tool-glyph">•</span>
                        <span className="tool-label">Bullet</span>
                      </button>
                      <button type="button" data-editor-action="numbered" title="Numbered list (Ctrl/Cmd+Shift+7)">
                        <span className="tool-glyph">1.</span>
                        <span className="tool-label">Numbered</span>
                      </button>
                      <button type="button" data-editor-action="link" title="Insert link (Ctrl/Cmd+K)">
                        <span className="tool-glyph">🔗</span>
                        <span className="tool-label">Link</span>
                      </button>
                      <button type="button" data-editor-action="linebreak" title="New paragraph">
                        <span className="tool-glyph">↵</span>
                        <span className="tool-label">Paragraph</span>
                      </button>
                      <button type="button" data-editor-action="undo" title="Undo (Ctrl/Cmd+Z)">
                        <span className="tool-glyph">↶</span>
                        <span className="tool-label">Undo</span>
                      </button>
                      <button type="button" data-editor-action="redo" title="Redo (Ctrl/Cmd+Y)">
                        <span className="tool-glyph">↷</span>
                        <span className="tool-label">Redo</span>
                      </button>
                    </div>
                    <div
                      id="blog2BodyEditor"
                      className="blog-editor-surface"
                      data-editor-source="blog2Body"
                      contentEditable
                      suppressContentEditableWarning
                    ></div>
                    <textarea id="blog2Body" name="blog2Body" rows={10} className="blog-editor-source is-hidden"></textarea>
                  </div>
                </label>
              </div>
            </details>

            <details className="editor-section blog-editor-section" data-blog-panel="3">
              <summary id="blog3SectionSummary">Blog Post 3</summary>
              <div className="blog-panel-meta">
                <p className="blog-panel-stats">
                  <span id="blog3BodyWords">0</span> words · <span id="blog3BodyChars">0</span> chars
                </p>
                <button type="button" className="btn-secondary" data-preview-blog-index="3">Preview Popup</button>
              </div>
              <div className="form-grid">
                <label className="field">
                  <span>Title</span>
                  <input id="blog3Title" name="blog3Title" type="text" required />
                </label>

                <label className="field">
                  <span>URL</span>
                  <input id="blog3Url" name="blog3Url" type="text" required />
                </label>

                <label className="field field--full">
                  <span>Card Description</span>
                  <textarea id="blog3Description" name="blog3Description" rows={4} required></textarea>
                </label>

                <label className="field field--full">
                  <span>Full Draft (Popup Content)</span>
                  <div className="blog-editor">
                    <div className="blog-editor-toolbar">
                      <button type="button" data-editor-action="paragraph" title="Normal paragraph">
                        <span className="tool-glyph">¶</span>
                        <span className="tool-label">Normal</span>
                      </button>
                      <button type="button" data-editor-action="heading" title="Heading 2">
                        <span className="tool-glyph">H2</span>
                        <span className="tool-label">Heading</span>
                      </button>
                      <button type="button" data-editor-action="bold" title="Bold (Ctrl/Cmd+B)">
                        <span className="tool-glyph">B</span>
                        <span className="tool-label">Bold</span>
                      </button>
                      <button type="button" data-editor-action="italic" title="Italic (Ctrl/Cmd+I)">
                        <span className="tool-glyph">I</span>
                        <span className="tool-label">Italic</span>
                      </button>
                      <button type="button" data-editor-action="underline" title="Underline (Ctrl/Cmd+U)">
                        <span className="tool-glyph">U</span>
                        <span className="tool-label">Underline</span>
                      </button>
                      <button type="button" data-editor-action="bullet" title="Bullet list (Ctrl/Cmd+Shift+8)">
                        <span className="tool-glyph">•</span>
                        <span className="tool-label">Bullet</span>
                      </button>
                      <button type="button" data-editor-action="numbered" title="Numbered list (Ctrl/Cmd+Shift+7)">
                        <span className="tool-glyph">1.</span>
                        <span className="tool-label">Numbered</span>
                      </button>
                      <button type="button" data-editor-action="link" title="Insert link (Ctrl/Cmd+K)">
                        <span className="tool-glyph">🔗</span>
                        <span className="tool-label">Link</span>
                      </button>
                      <button type="button" data-editor-action="linebreak" title="New paragraph">
                        <span className="tool-glyph">↵</span>
                        <span className="tool-label">Paragraph</span>
                      </button>
                      <button type="button" data-editor-action="undo" title="Undo (Ctrl/Cmd+Z)">
                        <span className="tool-glyph">↶</span>
                        <span className="tool-label">Undo</span>
                      </button>
                      <button type="button" data-editor-action="redo" title="Redo (Ctrl/Cmd+Y)">
                        <span className="tool-glyph">↷</span>
                        <span className="tool-label">Redo</span>
                      </button>
                    </div>
                    <div
                      id="blog3BodyEditor"
                      className="blog-editor-surface"
                      data-editor-source="blog3Body"
                      contentEditable
                      suppressContentEditableWarning
                    ></div>
                    <textarea id="blog3Body" name="blog3Body" rows={10} className="blog-editor-source is-hidden"></textarea>
                  </div>
                </label>
              </div>
            </details>

            <div className="editor-footer">
              <label className="field field--full">
                <span>Commit Message (Optional)</span>
                <input
                  id="blogCommitMessage"
                  name="blogCommitMessage"
                  type="text"
                  maxLength={140}
                  className="commit-input"
                  placeholder="Example: update blog post titles and body copy"
                />
              </label>

              <div className="admin-actions admin-actions--editor">
                <button type="submit" className="btn-primary">Save Blog Changes</button>
              </div>
            </div>
          </form>

          <p id="status-text" className="status-text" aria-live="polite"></p>
          <p className="status-help">Changes save to the Worker backend, then publish to GitHub Pages.</p>
        </section>
      </main>

      <div id="admin-blog-preview-modal" className="admin-blog-preview is-hidden" role="dialog" aria-modal="true" aria-labelledby="admin-blog-preview-title">
        <div className="admin-blog-preview__overlay" data-close-admin-preview="true"></div>
        <article className="admin-blog-preview__panel">
          <button type="button" className="admin-blog-preview__close" data-close-admin-preview="true" aria-label="Close preview">×</button>
          <img id="admin-blog-preview-image" className="admin-blog-preview__image" src="" alt="" />
          <div className="admin-blog-preview__content">
            <h3 id="admin-blog-preview-title"></h3>
            <p id="admin-blog-preview-summary" className="admin-blog-preview__summary"></p>
            <div id="admin-blog-preview-body" className="admin-blog-preview__body"></div>
            <a id="admin-blog-preview-link" className="btn ghost is-hidden" href="#" target="_blank" rel="noreferrer">Open Original Post</a>
          </div>
        </article>
      </div>

      <div id="editor-selection-toolbar" className="editor-selection-toolbar is-hidden" role="toolbar" aria-label="Text formatting">
        <button type="button" data-editor-action="bold" title="Bold (Ctrl/Cmd+B)">B</button>
        <button type="button" data-editor-action="italic" title="Italic (Ctrl/Cmd+I)">I</button>
        <button type="button" data-editor-action="underline" title="Underline (Ctrl/Cmd+U)">U</button>
        <div id="floating-heading-picker" className="floating-heading-picker">
          <button type="button" id="floating-heading-toggle" title="Heading levels" aria-haspopup="true" aria-expanded="false">H</button>
          <div id="floating-heading-menu" className="floating-heading-menu is-hidden">
            <button type="button" data-editor-action="paragraph" title="Normal text">N</button>
            <button type="button" data-editor-action="heading1" title="Heading 1">H1</button>
            <button type="button" data-editor-action="heading2" title="Heading 2">H2</button>
            <button type="button" data-editor-action="heading3" title="Heading 3">H3</button>
            <button type="button" data-editor-action="heading4" title="Heading 4">H4</button>
            <button type="button" data-editor-action="heading5" title="Heading 5">H5</button>
            <button type="button" data-editor-action="heading6" title="Heading 6">H6</button>
          </div>
        </div>
        <button type="button" data-editor-action="bullet" title="Bullet list">•</button>
        <button type="button" data-editor-action="numbered" title="Numbered list">1.</button>
        <button type="button" data-editor-action="link" title="Insert link (Ctrl/Cmd+K)">🔗</button>
      </div>
    </>
  )
}

export default AdminApp
