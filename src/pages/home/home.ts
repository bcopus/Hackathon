import { Component } from '@angular/core';
import { NavController } from 'ionic-angular';
import { Data } from '../../providers/data';

@Component({
  selector: 'page-home',
  templateUrl: 'home.html',
  providers: [Data]
})
export class HomePage {
  sections: any[] = [];
  currentLine: number = -1;

  constructor(public navCtrl: NavController, public dataService: Data) {
    this.sections.push(this.createStarterSection());
    console.log(JSON.stringify("constructor: sections = \n" + this.sections, null, 2));
  }//constructor()

  addSection() {
    let lastSection: any = this.sections[this.sections.length - 1];
    let lastRhyme: string = lastSection.rhymePattern;
    let lastLine: number = lastSection.lines[lastSection.lines.length -1].num;
    console.log("addSection() after line " + lastLine + " with rhyme pattern " + lastRhyme);
    this.sections.push(this.createSection(lastLine + 1, lastRhyme));
  }//addSection()

  loadRhymeSuggestions(section, word) {
    this.dataService.getRhymeSuggestions(word)
      .subscribe(data => {
          console.log("lyricChange() suggestions received: " + JSON.stringify(data, null, 2));
          section.suggestions = data;
          section.suggestions = section.suggestions.slice(0, 80);
      });
  }//loadRhymeSuggestions()

  clearRhymeSuggestions(section) {
    section.suggestions = [];
  }//clearRhymeSuggestions()

  lyricChange(section, line, text:string) {
    let tokens: string[] = [];
    console.log("lyricChange, line " + line.num + ", changed to " + text);
    line.text = text;
    tokens = text.split(" ");
    if(tokens.length > 0) {
      var word = tokens[tokens.length - 1];
      section.lines[line.num - section.firstLine].lastWord = word;
      console.log("lyricChange, setting lastWord of line " + line.num + " to " + word);
    }
  }//lyricChange()

  lyricLineFocus(section, lineNumber) {
    for(let s of this.sections) {
      s.outOfFocus = true;
    }
    section.outOfFocus = false;
    this.currentLine = lineNumber;
    console.log("lyricLineFocus, focus changed to line " + (lineNumber));
    console.log("lyricLineFocus, section's first and last lines are " + (section.firstLine) + ", "
        + section.lastLine);
    let matchingLine: number = section.rhymeAssociations[lineNumber - section.firstLine];
    console.log("lyricLineFocus, rhyming line is " + matchingLine);
    if((matchingLine != -1) && ("lastWord" in section.lines[matchingLine]) 
        && (section.lines[matchingLine].lastWord != "")) {
      console.log("lyricLineFocus, word with which to rhyme is " + section.lines[matchingLine].lastWord 
         + ", loading suggestions");
      this.loadRhymeSuggestions(section, section.lines[matchingLine].lastWord);
    } else {
      console.log("lyricLineFocus, no lastWord of line " + matchingLine + ", clearing suggestions");
      this.clearRhymeSuggestions(section);
    }
  }//lyricLineFocus()

  suggestionSelected(section, suggestion) {
    console.log("suggestionSelected: " + suggestion.word);
    section.lines[this.currentLine - section.firstLine].text += " " + suggestion.word;
  }//suggestionSelected()

  showLinesInConsole() {
    let out: string = "";
    for(let section of this.sections) {
      for(let line of section.lines) {
        out += line.num + " " + line.text + " (" + line.rhyme + ")\n";
      }
    }
    console.log(out);
  }//showLinesInConsole()

  createStarterSection() : any {
    return this.createSection(1, 'AABB');;    
  }//createDefaultSection()

  createSection(nextLine: number, rhymePattern: string) : any {
    let section: any = {};
    section.lines = [];
    section.outOfFocus = true;

    let tokens: string[] = [];
    tokens = rhymePattern.split("");
    section.firstLine = nextLine;
    section.lastLine = nextLine + tokens.length - 1;
    section.rhymePattern = rhymePattern;
    section.suggestions = [];

    let ob: any;
    for(let token of tokens){
      ob = {};
      ob.num = nextLine++;
      ob.text = "";
      ob.rhyme = token;
      ob.lastWord = "";
      section.lines.push(ob);
    }

    switch(rhymePattern) {
      case 'AABB': section.rhymeAssociations = [1, 0, 3, 2]; break;
      case 'ABAB': section.rhymeAssociations = [2, 3, 0, 1]; break;
      case 'ABCB': section.rhymeAssociations = [-1, 3, -1, 1]; break;
      case 'AABBC': section.rhymeAssociations = [1, 0, 3, 2, -1]; break;      
      case 'AABBAA': section.rhymeAssociations = [1, 0, 3, 2, 0, 0]; break;
      case 'AABBCC': section.rhymeAssociations = [1, 0, 3, 2, 5, 4]; break;
      case 'AA' : section.rhymeAssociations = [1, 0]; break;
    }//switch

    return section;    
  }//createSection()

  rhymePatternChange(section: any, rhymePattern: string) {
    let tokens: string[] = [];
    tokens = rhymePattern.split("");
    console.log("rhymePatternChange to pattern: " + rhymePattern);
    if(tokens.length > section.lastLine - section.firstLine) {
      //need to add some lines and renumber the song
      for(let i = 0; i < (tokens.length - (section.lastLine - section.firstLine) - 1); i++) {
        let ob: any = {};
        ob.num = 0;
        ob.text = "";
        ob.lastWord = "";
        section.lines.push(ob);
      }
      this.renumberSections();
    } else if(tokens.length <= (section.lastLine - section.firstLine)) {
      //delete extra lines
      for(let i = 0; i <= ((section.lastLine - section.firstLine) - tokens.length); i++) {
        section.lines.pop();
      }
      this.renumberSections();
    }
    //now set the rhyme pattern for each line
    for(let i = 0; i <= section.lastLine - section.firstLine; i++) {
      section.lines[i].rhyme = tokens[i];
      console.log("setting rhyme for line " + i + " to " + tokens[i]);
    }
    section.rhymePattern = rhymePattern;
    console.log("rhymePattern Changed: " + section.rhymePattern);
    switch(rhymePattern) {
      case 'AABB': section.rhymeAssociations = [1, 0, 3, 2]; break;
      case 'ABAB': section.rhymeAssociations = [2, 3, 0, 1]; break;
      case 'ABCB': section.rhymeAssociations = [-1, 3, -1, 1]; break;
      case 'AABBC': section.rhymeAssociations = [1, 0, 3, 2, -1]; break;      
      case 'AABBAA': section.rhymeAssociations = [1, 0, 3, 2, 0, 0]; break;
      case 'AABBCC': section.rhymeAssociations = [1, 0, 3, 2, 5, 4]; break;
      case 'AA' : section.rhymeAssociations = [1, 0]; break;
    }//case
  }//rhymePatternChange()

  renumberSections() {
    let lineNum: number = 1;
    for(let section of this.sections) {
      section.firstLine = lineNum;
      for(let line of section.lines) {
        line.num = lineNum++;
      }
      section.lastLine = lineNum - 1;
      console.log("renumberSections, section contains lines " + section.firstLine 
          + " to " + section.lastLine)
    }
  }//renumberSections()

}//HomePage
