import React, {useEffect} from 'react';
import DropDownPicker from 'react-native-dropdown-picker';
import {Chip} from "react-native-paper";
import {View} from "react-native"; // Import ValueType

interface CustomDropDownProps<T> {
    schema: {
        label: string
        value: string
    };
    items: Array<T>;
    searchable?: boolean;
    open: boolean;
    setOpen: React.Dispatch<React.SetStateAction<boolean>>;
    containerStyle?: object;
    value: any
    setValue: React.Dispatch<React.SetStateAction<any>>;
    itemSeparator?: boolean;
    onChangeValue?: (value: string | null) => void;
    zIndex?: number
    zIndexInverse?: number
    placeholder?: string;
    multiple?: any; // Added a new prop for multiple selections
    loading?: boolean;
}

const CustomDropDown = <T,>({
                                items,
                                schema,
                                searchable = true,
                                open,
                                setOpen,
                                containerStyle,
                                value,
                                setValue,
                                itemSeparator,
                                onChangeValue,
                                zIndex,
                                zIndexInverse,
                                placeholder,
                                multiple = false, // Default to false if not provided
                                loading = false
                            }: CustomDropDownProps<T>) => {

    const handleDelete = (itemValue: string) => {
        setValue((prevValue: any) => prevValue.filter((v: string) => v !== itemValue));
    };

    return (
        <>
            <DropDownPicker
                loading={loading}
                schema={schema}
                zIndex={zIndex}
                zIndexInverse={zIndexInverse}
                items={items}
                searchable={searchable}
                open={open}
                setOpen={setOpen}
                containerStyle={{ height: 40, marginBottom: 16, ...containerStyle }}
                value={value}
                setValue={setValue}
                itemSeparator={itemSeparator}
                onChangeValue={onChangeValue}
                placeholder={placeholder}
                multiple={multiple} // Pass the multiple prop to DropDownPicker
            />
            <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
                {Array.isArray(value) && value.map((v: string) => {
                    const item = items.find((item: T) => item[schema.value] === v);
                    return (
                        <Chip key={v} onClose={() => handleDelete(v)} style={{ margin: 4 }}>
                            {item ? item[schema.label] : 'Loading...'}
                        </Chip>
                    );
                })}
            </View>
        </>
    );
};

export default CustomDropDown;
