import {MarkdownBook} from './markdown-book';
import {bindable, observable} from 'aurelia-framework';

export class MarkdownBook2 extends MarkdownBook {
    @bindable summary;
    @bindable index;
    @bindable base='';
    @bindable params;
    @observable toc = '<p>some toc</p>'
    //shownav=true;


    constructor() {
      super();
    }

    bind() {
      super.bind();
      this.shownav = true;
      this.showtoc = true;
      //console.log('markdownbook bind shownav', this.shownav);
    }

    attached() {
      console.log('markdown book2 attached() toc', this.toc);
      //super.attached();
      //console.log('markdownbook attached shownav', this.shownav);
    }

    tocChanged(newValue, oldValue) {
      this.mytoc.innerHTML = newValue;
    }

    scrollto(id) {
      let el = document.getElementById(id);
      console.log('markdownbook2 scrollto() id,el', id, el);
      el.scrollIntoView();
      //        document.getElementById(id).scrollIntoView();
    }
}
