import React, { ChangeEvent, FunctionComponent } from 'react';
import Dialog from '@material-ui/core/Dialog';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';
import Typography from '@material-ui/core/Typography';
import makeStyles from '@material-ui/core/styles/makeStyles';
import Divider from '@material-ui/core/Divider';
import Switch from '@material-ui/core/Switch';
import TextField from '@material-ui/core/TextField';
import List from '@material-ui/core/List';
import ListItemText from '@material-ui/core/ListItemText';
import ListItem from '@material-ui/core/ListItem';
import ListItemSecondaryAction from '@material-ui/core/ListItemSecondaryAction';
import Paper from '@material-ui/core/Paper';
import Box from '@material-ui/core/Box';
import { I18N } from '../config';
import { ControlState, TIME_ANIMATION_INTERVALS, TimeAnimationInterval } from '../states/controlState';
import MenuItem from '@material-ui/core/MenuItem';
import Menu from '@material-ui/core/Menu';
import { Server } from '../model/server';
import { darken, lighten } from '@material-ui/core/styles/colorManipulator';

const useStyles = makeStyles(theme => ({
        settingsPanelTitle: {
            marginBottom: theme.spacing(1),
        },
        settingsPanelPaper: {
            backgroundColor: (theme.palette.type === 'dark' ? lighten : darken)(theme.palette.background.paper, 0.1),
            marginBottom: theme.spacing(2),
        },
        settingsPanelList: {
            margin: 0,
        },
        settingsPanelListItem: {},
        textField: {
            marginLeft: theme.spacing(1),
            marginRight: theme.spacing(1),
            fontSize: theme.typography.fontSize / 2
        },

        localeAvatar: {
            margin: 10,
        }
    }
));

interface SettingsDialogProps {
    open: boolean;
    closeDialog: (dialogId: string) => void;

    settings: ControlState;
    selectedServer: Server;
    updateSettings: (settings: ControlState) => void;
    changeLocale: (locale: string) => void;
    openDialog: (dialogId: string) => void;
}

export default function SettingsDialog({open, closeDialog, settings, selectedServer, updateSettings, changeLocale, openDialog}: SettingsDialogProps) {
    const [languageMenuAnchor, setLanguageMenuAnchor] = React.useState(null);
    const classes = useStyles();

    if (!open) {
        return null;
    }

    function handleCloseDialog() {
        closeDialog('settings');
    }

    function handleOpenServerDialog() {
        openDialog('server');
    }

    function handleTimeAnimationIntervalChange(event: ChangeEvent<HTMLSelectElement>) {
        updateSettings({...settings, timeAnimationInterval: parseInt(event.target.value) as TimeAnimationInterval});
    }

    const localeMenuItems = Object.getOwnPropertyNames(I18N.languages).map(langLocale => {
        const langName = I18N.languages[langLocale];
        return (
            <MenuItem
                button
                key={langLocale}
                selected={langLocale === settings.locale}
                onClick={() => changeLocale(langLocale)}
            >
                <ListItemText primary={langName}/>
            </MenuItem>
        );
    });

    function handleLanguageMenuOpen(event: any) {
        setLanguageMenuAnchor(event.currentTarget);
    }

    function handleLanguageMenuClose() {
        setLanguageMenuAnchor(null);
    }

    return (
        <div>
            <Dialog
                open={open}
                fullWidth
                maxWidth={'sm'}
                onClose={handleCloseDialog}
                scroll='body'
            >
                <DialogTitle>{I18N.get('Settings')}</DialogTitle>
                <DialogContent>

                    <SettingsPanel title={I18N.get('General')}>
                        <SettingsSubPanel
                            label={I18N.get('Server')}
                            value={selectedServer.name}
                            onClick={handleOpenServerDialog}>
                        </SettingsSubPanel>
                        <SettingsSubPanel
                            label={I18N.get('Language')}
                            value={I18N.languages[settings.locale]}
                            onClick={handleLanguageMenuOpen}>
                        </SettingsSubPanel>
                        <SettingsSubPanel label={I18N.get('Time interval of the player')}>
                            <TextField
                                select
                                className={classes.textField}
                                value={settings.timeAnimationInterval}
                                onChange={handleTimeAnimationIntervalChange}
                                margin="normal"
                            >
                                {TIME_ANIMATION_INTERVALS.map(value => (
                                    <MenuItem key={value} value={value}>{value + ' ms'}</MenuItem>
                                ))}
                            </TextField>
                        </SettingsSubPanel>
                    </SettingsPanel>

                    <SettingsPanel title={I18N.get('Time-Series')}>
                        <SettingsSubPanel label={I18N.get('Show graph after adding a point')}
                                          value={getOnOff(settings.autoShowTimeSeries)}>
                            <ToggleSetting
                                propertyName={'autoShowTimeSeries'}
                                settings={settings}
                                updateSettings={updateSettings}
                            />
                        </SettingsSubPanel>
                        <SettingsSubPanel label={I18N.get('Show data points only')}
                                          value={getOnOff(settings.showTimeSeriesPointsOnly)}>
                            <ToggleSetting
                                propertyName={'showTimeSeriesPointsOnly'}
                                settings={settings}
                                updateSettings={updateSettings}
                            />
                        </SettingsSubPanel>
                        <SettingsSubPanel label={I18N.get('Show error bars')}
                                          value={getOnOff(settings.showTimeSeriesErrorBars)}>
                            <ToggleSetting
                                propertyName={'showTimeSeriesErrorBars'}
                                settings={settings}
                                updateSettings={updateSettings}
                            />
                        </SettingsSubPanel>
                    </SettingsPanel>

                </DialogContent>
            </Dialog>

            <Menu
                anchorEl={languageMenuAnchor}
                keepMounted
                open={Boolean(languageMenuAnchor)}
                onClose={handleLanguageMenuClose}
            >
                {localeMenuItems}
            </Menu>

        </div>
    );
}

interface SettingsPanelProps {
    title: string;
}

const SettingsPanel: FunctionComponent<SettingsPanelProps> = (props) => {
    const classes = useStyles();

    const childCount = React.Children.count(props.children);

    const listItems: React.ReactNode[] = [];
    React.Children.forEach(props.children, (child: React.ReactNode, index: number) => {
        listItems.push(child);
        if (index < childCount - 1) {
            listItems.push(<Divider key={childCount + index} variant="fullWidth" component="li"/>);
        }
    });

    return (
        <Box>
            <Typography variant='body1' className={classes.settingsPanelTitle}>
                {props.title}
            </Typography>
            <Paper elevation={4} className={classes.settingsPanelPaper}>
                <List component="nav" dense={true} className={classes.settingsPanelList}>
                    {listItems}
                </List>
            </Paper>
        </Box>
    );
};

interface SettingsSubPanelProps {
    label: string;
    value?: string | number;
    onClick?: (event: any) => void;
}

const SettingsSubPanel: FunctionComponent<SettingsSubPanelProps> = (props) => {
    const classes = useStyles();

    const listItemText = (<ListItemText primary={props.label} secondary={props.value}/>);

    let listItemSecondaryAction;
    if (props.children) {
        listItemSecondaryAction = (
            <ListItemSecondaryAction>
                {props.children}
            </ListItemSecondaryAction>
        );
    }

    if (!!props.onClick) {
        return (
            <ListItem button onClick={props.onClick} className={classes.settingsPanelListItem}>
                {listItemText}
                {listItemSecondaryAction}
            </ListItem>
        );
    }

    return (
        <ListItem className={classes.settingsPanelListItem}>
            {listItemText}
            {listItemSecondaryAction}
        </ListItem>
    );
};


interface ToggleSettingProps {
    propertyName: string;
    settings: ControlState;
    updateSettings: (settings: ControlState) => void;
}

const ToggleSetting = (props: ToggleSettingProps) => {
    const {propertyName, settings, updateSettings} = props;
    return (
        <Switch
            checked={settings[propertyName]}
            onChange={() => updateSettings({...settings, [propertyName]: !props.settings[propertyName]})}
        />
    );
};

const getOnOff = (state: boolean) => {
    return state ? I18N.get('On') : I18N.get('Off');
};
