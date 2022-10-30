import { connect } from 'react-redux';

import { AppState } from '../states/appState';
import UserPlacesDialog from '../components/UserPlacesDialog';
import { closeDialog, updateSettings } from '../actions/controlActions';
import { addUserPlacesFromText } from '../actions/dataActions';


const mapStateToProps = (state: AppState) => {
    return {
        open: !!state.controlState.dialogOpen['addUserPlacesFromText'],
        placeLabelPropertyNames: state.controlState.placeLabelPropertyNames,
        placeLabelPrefix: state.controlState.placeLabelPrefix,
    };
};

const mapDispatchToProps = {
    closeDialog,
    updateSettings,
    addUserPlacesFromText: addUserPlacesFromText,
};

export default connect(mapStateToProps, mapDispatchToProps)(UserPlacesDialog);
