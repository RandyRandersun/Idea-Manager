'use strict';

class searchResultInstance extends HTMLDivElement {
  
	constructor(title, notepadText, index, projectTitle) {
		super();
		this.title = title;
		this.notepadText = notepadText;
		this.index = index;
		this.projectTitle = projectTitle;
		
		this.handleOpenNotepad = this.handleOpenNotepad.bind(this);
	}
  
	connectedCallback() {
		const template = document.getElementById('searchResultInstance');
		const node = document.importNode(template.content, true);
		this.appendChild(node);
		
		this.className = 'search-result-instance';
		this.querySelector('.result-title-text-area').value = this.title;
		this.querySelector('.result-content-text-area').value = this.notepadText;
		
		this.addEventListener('click', this.handleOpenNotepad);
	}
  
	disconnectedCallback() {
		this.removeEventListener('click', this.handleOpenNotepad);
	}
	
	handleOpenNotepad(){
		let rightTextArea = document.getElementById('rightTextArea');
		rightTextArea.innerHTML = '';
		rightTextArea.appendChild(new NotepadInstance(this.projectTitle, this.title, this.notepadText, this.index));
		
		document.querySelector("#"+this.projectTitle +"projectInstance").toggleCollapseOpen();
		let ideaInstance = document.querySelector("#"+this.projectTitle+"projectInstance #ideaContainer #"+this.title+"-"+this.index+"DirectoryInstance");
		ideaInstance.handleNotepadSwap();
	}
}

customElements.define('search-result-instance', searchResultInstance, { extends: "div" });