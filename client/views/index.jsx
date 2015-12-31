var React = require('react');

var PopupMenu = module.exports = React.createClass({
  render: function() {
    console.log('PopupMenu: ' + JSON.stringify(this.props));
    return (
      <div id={this.props.menuId} className="btn-group dropup to-bottom-right pull-right">
        <PopupMenuButton popupMenuBtnId={this.props.popupMenuBtnId}/> 
        <PopupDropdownMenuList 
          menuItems={this.props.menuItems} 
          checkmark={this.props.checkmark} />
      </div>
    );
  }
});

var PopupMenuButton = React.createClass({
  render: function() {
    return (
      <button id={this.props.popupMenuBtnId} type="button" className="btn btn-default dropdown-toggle" 
          data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">☰</button>
    );
  }
});

var PopupDropdownMenuList = React.createClass({
  getInitialState: function() {
    return {
      menuItems: this.props.menuItems.map(function(ea) {
        ea.menuItemHtml = ea.menuItemTitle;
        return ea;  
      })
    };
  },
  handleMenuItemClick: function(menuItemId, checked) {
    var menuItem = this.state.menuItems.find(function(menuItem) {
      return menuItem.menuItemId === menuItemId;  
    });

    var newMenuItemHtml = (checked ? this.props.checkmark : '') + menuItem.menuItemTitle;
    menuItem.menuItemHtml = newMenuItemHtml;

    this.setState({menuItems: this.state.menuItems});

    if (menuItem.onClick) {
      menuItem.onClick(checked);
    }
  },
  render: function() {
    var menuItems = this.state.menuItems.map(function(ea) {
      return (
        <PopupDropdownMenuItem 
          key={ea.menuItemId} 
          menuItemId={ea.menuItemId}
          menuItemHtml={ea.menuItemHtml}
          initiallyChecked={ea.initiallyChecked} 
          checkmark={this.props.checkmark}
          onClick={this.handleMenuItemClick} />
      );

    }.bind(this));

    return (
      <ul className="dropdown-menu">
        {menuItems}
      </ul>
    );
  }
});

var PopupDropdownMenuItem = React.createClass({
  propTypes: {
    onClick: React.PropTypes.func.isRequired
  },
  getInitialState: function() {
    return {
      checked: this.props.initiallyChecked || false
    };
  },
  handleClick: function() {
    var newChecked = !this.state.checked;
    this.setState({checked: newChecked});
    this.props.onClick(this.props.menuItemId, newChecked);
  },
  render: function() {
    return (
      <li><a id={this.props.menuItemId} href="#" onClick={this.handleClick}>{this.props.menuItemHtml}</a></li>
    );
  }
});