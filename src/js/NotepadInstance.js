'use strict';

class NotepadInstance extends HTMLDivElement {
  
	constructor(projectTitle, title, displayText, index) {
		super();
		
		this.projectTitle = projectTitle;
		this.title = title;
		this.displayText = displayText;
		this.index = index;
		this.id = this.projectTitle + "-" + this.title + "-" + this.index;
		this.className = "notepad-instance";
		
		this.resize = this.resize.bind(this);
		this.delayedResize = this.delayedResize.bind(this);
		this.keydownHandler = this.keydownHandler.bind(this);
		this.handleSaveNote = this.handleSaveNote.bind(this);
		this.handleUpdateTitle_down = this.handleUpdateTitle_down.bind(this);
		this.updateDirectory = this.updateDirectory.bind(this);
	}
  
	connectedCallback() {
		const template = document.getElementById("notepadInstance");
		const node = document.importNode(template.content, true);
		this.appendChild(node);
		
		let titleTextArea = this.querySelector(".title-text-area");
		let contentTextArea = this.querySelector(".content-text-area");
		titleTextArea.value = this.title;
		contentTextArea.value = this.displayText;
		
		contentTextArea.addEventListener("cut", this.delayedResize);
		contentTextArea.addEventListener("paste", this.delayedResize);
		contentTextArea.addEventListener("drop", this.delayedResize);
		contentTextArea.addEventListener("keydown", this.keydownHandler);
		
		titleTextArea.addEventListener("cut", this.handleSaveNote);
		titleTextArea.addEventListener("paste", this.handleSaveNote);
		titleTextArea.addEventListener("drop", this.handleSaveNote);
		titleTextArea.addEventListener("keyup", this.handleSaveNote);
		titleTextArea.addEventListener("keydown", this.handleUpdateTitle_down);
		
		this.resize();
		titleTextArea.style.color = "White";
	}
  
	disconnectedCallback() {
		let contentTextArea = this.querySelector(".content-text-area");
		contentTextArea.removeEventListener("cut", this.delayedResize);
		contentTextArea.removeEventListener("paste", this.delayedResize);
		contentTextArea.removeEventListener("drop", this.delayedResize);
		contentTextArea.removeEventListener("keydown", this.keydownHandler);
		
		let titleTextArea = this.querySelector(".title-text-area");
		titleTextArea.removeEventListener("cut", this.handleSaveNote);
		titleTextArea.removeEventListener("paste", this.handleSaveNote);
		titleTextArea.removeEventListener("drop", this.handleSaveNote);
		titleTextArea.removeEventListener("keyup", this.handleSaveNote);
		titleTextArea.removeEventListener("keydown", this.handleUpdateTitle_down);
	}
	
	handleUpdateTitle_down(e){
		//The first char CANNOT be a number
		if(this.querySelector(".title-text-area").value == '' &&  isFinite(event.key)){
			e.preventDefault();
		}
		// Replace space with _
		else if(e.key == " "){
			e.preventDefault();
			this.querySelector(".title-text-area").value = this.querySelector(".title-text-area").value +"_";
		}
		// Allow alphanumeric
		else if((/^[a-z0-9]+$/i).test(e.key) || e.key == "_" || e.key == "-" ){
			
		}
		// Ignore rest
		else{
			e.preventDefault();
		}
	}
	
	//Need to update the directory instance with the new title information
	updateDirectory(){
		let titleText = this.querySelector(".title-text-area").value.replace(" ","_");
		let linkTextElm = document.querySelector("#"+this.projectTitle+"projectInstance #ideaContainer #"+this.title+"R-"+this.index+"DirectoryInstance #open-idea-link");
		let parentElm = document.querySelector("#"+this.projectTitle+"projectInstance #ideaContainer #"+this.title+"R-"+this.index+"DirectoryInstance");
		
		linkTextElm.setAttribute('title-text',titleText);
		linkTextElm.innerHTML = titleText;
		linkTextElm.title = titleText;
		linkTextElm.notepadText = this.querySelector(".content-text-area").value;
		
		parentElm.title = titleText;
		parentElm.notepadText = this.querySelector(".content-text-area").value;
		
		this.title = titleText;
		this.id = this.projectTitle + "-" + this.title + "-" + this.index;
		
		parentElm.id = (titleText +"R-"+this.index+"DirectoryInstance");
	}
	
	//Save the note to the db
	handleSaveNote(e){
		console.log('save note');
		let titleTextArea = this.querySelector(".title-text-area");
		let titleText = titleTextArea.value.replace(" ","_");
		titleTextArea.value = titleText;
		let contentText = this.querySelector(".content-text-area").value;
		
		let rest = JSON.parse(window.localStorage.getItem(this.projectTitle));
			
		rest.ideas[this.index].ideaName = titleText;
		rest.ideas[this.index].ideaText = contentText;
		
		window.localStorage.setItem(this.projectTitle, JSON.stringify(rest));
		
		document.querySelector('.directory-instance').updateSearchSpace(this.projectTitle, rest);
		this.updateDirectory();
	}
	
	//Resize the content text area
	resize(){
		this.handleSaveNote();

		let container = document.querySelector("#rightTextArea");
		let scrollPosition = container.scrollTop;
		let scrollPosition2 = container.scrollLeft;
		let text = this.querySelector(".content-text-area");
		text.style.height = '1em';
        text.style.height = (text.scrollHeight+50)+'px';
		
		text.style.width = '1em';
		text.style.width = (text.scrollWidth+50)+'px';
		
		container.scrollTop = scrollPosition;
		container.scrollLeft = scrollPosition2;
	}
	
	delayedResize(){
		window.setTimeout(this.resize, 0);
	}
	
	//Replace TAB with 4 spaces for formatting
	keydownHandler(e){
		if(e.keyCode === 9) { // TAB
			let start = this.querySelector(".content-text-area").selectionStart;
			let end = this.querySelector(".content-text-area").selectionEnd;
			
			let value = this.querySelector(".content-text-area").value;
			
			this.querySelector(".content-text-area").value = (value.substring(0, start)
                    + "    "
                    + value.substring(end));

			this.querySelector(".content-text-area").selectionStart = this.querySelector(".content-text-area").selectionEnd = start + 4;

			// prevent the focus lose
			e.preventDefault();
		}
		this.delayedResize();
	}
}

customElements.define('notepad-instance', NotepadInstance, { extends: "div" });