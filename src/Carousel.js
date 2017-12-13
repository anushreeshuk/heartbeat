'use strict';

import React, { Component } from 'react'; //import React Component

import {
  Button, Card, CardText, CardImg, CardSubtitle, CardBody,
  CardTitle, Modal, ModalHeader, ModalBody, ModalFooter, Input,
  Container, Row, Col, ButtonGroup, Label, FormGroup,
  Carousel,
  CarouselItem,
  CarouselControl,
  CarouselIndicators,
  CarouselCaption
} from 'reactstrap';


export class PhotoCarousel extends Component {
    constructor(props) {
      super(props);
      this.state = { activeIndex: 0 };
      this.next = this.next.bind(this);
      this.previous = this.previous.bind(this);
      this.goToIndex = this.goToIndex.bind(this);
      this.onExiting = this.onExiting.bind(this);
      this.onExited = this.onExited.bind(this);
    }
  
    onExiting() {
      this.animating = true;
    }
  
    onExited() {
      this.animating = false;
    }
  
    next() {
      if (this.animating) return;
      const nextIndex = this.state.activeIndex === this.props.items.length - 1 ? 0 : this.state.activeIndex + 1;
      this.setState({ activeIndex: nextIndex });
    }
  
    previous() {
      if (this.animating) return;
      const nextIndex = this.state.activeIndex === 0 ? this.props.items.length - 1 : this.state.activeIndex - 1;
      this.setState({ activeIndex: nextIndex });
    }
  
    goToIndex(newIndex) {
      if (this.animating) return;
      this.setState({ activeIndex: newIndex });
    }
  
    render() {
      let { activeIndex } = this.state;
  
      let slides = this.props.items.map((item) => {
        return (
          <CarouselItem
            key={item}
            onExiting={this.onExiting}
            onExited={this.onExited}
            key={item.src}
            src={item.src}
            altText={item.altText}
          >
            <CarouselCaption captionText={"none"} captionHeader={item.caption} />
          </CarouselItem>
        );
      });
  
      return (
        <Carousel
          activeIndex={activeIndex}
          next={this.next}
          previous={this.previous}
        >
          <CarouselIndicators items={this.props.items} activeIndex={activeIndex} onClickHandler={this.goToIndex} />
          {slides}
          <CarouselControl direction="prev" directionText="Previous" onClickHandler={this.previous} />
          <CarouselControl direction="next" directionText="Next" onClickHandler={this.next} />
        </Carousel>
      );
    }
  }