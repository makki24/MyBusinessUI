// SwitchInput.tsx
import React from 'react';
import { View } from 'react-native';
import { useTheme, Switch, Text } from 'react-native-paper';

interface SwitchInputProps {
    label: string;
    value: boolean;
    onValueChange: (value: boolean) => void;
}

const SwitchInput: React.FC<SwitchInputProps> = ({ label, value, onValueChange }) => {
    const theme = useTheme();

    return (
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Switch
                value={value}
                onValueChange={onValueChange}
                color={theme.colors.primary} // Adjust the color based on your theme
            />
            <Text>{label}</Text>
        </View>
    );
};

export default SwitchInput;
