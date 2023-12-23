// DateTimePicker.tsx
import React, { useCallback } from 'react';
import {View, Text, StyleSheet} from 'react-native';
import { DatePickerInput, TimePickerModal } from 'react-native-paper-dates';
import { Button } from 'react-native-paper';

interface DateTimePickerProps {
    label: string;
    dateValue: Date;
    onDateChange: (date: Date) => void;
    onTimeChange: (time: { hours: number | undefined; minutes: number | undefined }) => void;
    timeValue: { hours: number | undefined; minutes: number | undefined };
}

const DateTimePicker: React.FC<DateTimePickerProps> = ({
                                                           label,
                                                           dateValue,
                                                           onDateChange,
                                                           onTimeChange,
                                                           timeValue,
                                                       }) => {
    const timeFormatter = React.useMemo(
        () =>
            new Intl.DateTimeFormat('en', {
                hour: '2-digit',
                minute: '2-digit',
                hour12: false,
            }),
        []
    );

    const [timeOpen, setTimeOpen] = React.useState(false);

    const maxFontSizeMultiplier = 1.5;


    const onConfirmTime = useCallback(
        ({ hours, minutes }: any) => {
            setTimeOpen(false);
            onTimeChange({ hours, minutes });
        },
        [setTimeOpen, onTimeChange]
    );

    const onDismissTime = useCallback(() => {
        setTimeOpen(false);
    }, [setTimeOpen]);

    return (
        <View>
            {/* Date picker */}
            <DatePickerInput
                locale="en"
                label={label}
                value={dateValue}
                onChange={(d) => onDateChange(d || new Date())}
                inputMode="start"
                style={styles.inputField}
            />

            {/* Time picker */}
            <View style={[styles.row, styles.marginVerticalEight]}>
                <View style={styles.section}>
                    <Text maxFontSizeMultiplier={maxFontSizeMultiplier} style={styles.bold}>
                        Time
                    </Text>
                    <Text maxFontSizeMultiplier={maxFontSizeMultiplier}>
                        {timeValue && timeValue.hours !== undefined && timeValue.minutes !== undefined
                            ? timeFormatter.format(new Date().setHours(timeValue.hours, timeValue.minutes))
                            : `Current Time: ${timeFormatter.format(new Date())}`}
                    </Text>
                </View>
                <Button onPress={() => setTimeOpen(true)} uppercase={false} mode="contained-tonal">
                    Pick time
                </Button>
            </View>

            {/* Time picker modal */}
            <TimePickerModal
                locale={'en'}
                visible={timeOpen}
                onDismiss={onDismissTime}
                onConfirm={onConfirmTime}
                hours={timeValue.hours}
                minutes={timeValue.minutes}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    bold: {
        fontWeight: 'bold',
    },
    row: {
        flexDirection: 'row',
    },
    section: {
        flex: 1,
        flexDirection: 'column',
        justifyContent: 'space-between',
    },
    marginVerticalEight: {
        marginVertical: 8,
    },
    inputField: {
        marginBottom: 8,
    },
    modalContainer: {
        backgroundColor: 'white',
        padding: 20,
        borderRadius: 10,
        alignSelf: 'center', // Center the modal on the screen
        width: '80%', // Set the width to a percentage of the screen width
    },
    modalButtonGap: {
        height: 5,
    }
});


export default DateTimePicker;
