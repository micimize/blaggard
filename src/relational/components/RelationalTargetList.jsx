import React, { PropTypes, Component } from 'react';
import { DropTarget } from 'react-dnd';
import GenericStaticView from './SubtlyEditableItem/staticViews'

function collect(connect, monitor){
    return {
        connectDropTarget: connect.dropTarget(),
        isOver: monitor.isOver(),
        canDrop: monitor.canDrop()
    }
}


const targetActions = {
  hover(props, monitor, component) {
    const dragIndex = monitor.getItem().index;
    const hoverIndex = props.targetIndex;

    /* Don't replace items with themselves
    if (dragIndex === hoverIndex) {
      return;
    }*/

    // Determine rectangle on screen
    const hoverBoundingRect = findDOMNode(component).getBoundingClientRect();

    // Get vertical middle
    const hoverMiddleY = (hoverBoundingRect.bottom - hoverBoundingRect.top) / 2;

    // Determine mouse position
    const clientOffset = monitor.getClientOffset();

    // Get pixels to the top
    const hoverClientY = clientOffset.y - hoverBoundingRect.top;

    // Only perform the move when the mouse has crossed half of the items height
    // When dragging downwards, only move when the cursor is below 50%
    // When dragging upwards, only move when the cursor is above 50%

    // Dragging downwards
    if (hoverClientY < hoverMiddleY) {
      return;
    }

    // Dragging upwards
    if (hoverClientY > hoverMiddleY) {
      return;
    }

    // Time to actually perform the action
    props.addReference({reference: dragIndex, targetIndex: hoverIndex});
  }
};

class ListItemWrapper extends React.Component{
  static propTypes = {
    connectDropTarget: PropTypes.func.isRequired,
    isOver: PropTypes.bool.isRequired,
    canDrop: PropTypes.bool.isRequired
  }

  render() {
    const { children, canDrop, isOver, connectDropTarget } = this.props
    const isActive = canDrop && isOver

    return connectDropTarget(<li>{children}</li>)
  }
}

function buildTargetListTemplate(ItemTemplate){
    class TargetList extends Component {
      static propTypes = { ItemTemplate }
      addReference({reference, targetIndex}) {
          this.setState(update(this.state, {
              cards: {
                  $splice: [
                      [targetIndex, 0, reference]
                  ]
              }
          }));
      }

      render() {
        const { value=[], options: {item: {staticTemplate: Template=GenericStaticView, ...itemOpts} = {}} = {} } = this.props
        return (
            <ul>
                {value.map((v, key) => (
                    <ItemTemplate index={key}>
                        <Template value={v} options={itemOpts}/>
                    </ItemTemplate>
                ))}
            </ul>
        )
      }
  }
  return props => <TargetList {...props}/>
}

export default function buildRelationalTargetList(dragKey){
    return buildTargetListTemplate(DropTarget(dragKey, targetActions, collect)(ListItemWrapper))
}
