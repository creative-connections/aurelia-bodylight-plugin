import 'isomorphic-fetch';
import '@danzen/createjs';
import {StageComponent} from 'aurelia-testing';
import {bootstrap} from 'aurelia-bootstrapper';
import {Plotly} from '../../../src/elements/plotly';


describe('markdown element',  () => {
  let component;
  beforeEach(() => {
    //fake function to satisfy plotly
    //window.URL.createObjectURL = function() {return {}};
  });

  afterEach(() => {
    if (component) {
      component.dispose();
      component = null;
    }
  });

  it('creates div and section with md content', done => {
    //waitForTimeout(500);
    component = StageComponent
      .withResources('elements/markdownaurelia')
      .inView('<markdownaurelia></markdownaurelia>');


    component.create(bootstrap).then(() => {
      const view = component.element;
      const section = view.getElementsByTagName('section');
      expect(section.length).toBe(1);
      const div = view.getElementsByTagName('div');
      expect(div.length).toBe(1);
      done();
    }).catch(e => {
      fail(e);
      done();
    });
  });
});
