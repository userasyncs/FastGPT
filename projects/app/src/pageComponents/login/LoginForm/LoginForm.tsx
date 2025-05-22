import React, { type Dispatch } from 'react';
import { FormControl, Flex, Input, Button, Box, Link } from '@chakra-ui/react';
import { useForm } from 'react-hook-form';
import { LoginPageTypeEnum } from '@/web/support/user/login/constants';
import { postLogin, getPreLogin } from '@/web/support/user/api';
import type { ResLogin } from '@/global/support/api/userRes';
import { useToast } from '@fastgpt/web/hooks/useToast';
import { useSystemStore } from '@/web/common/system/useSystemStore';
import { getDocPath } from '@/web/common/system/doc';
import { useTranslation } from 'next-i18next';
import FormLayout from './FormLayout';
import { useRequest2 } from '@fastgpt/web/hooks/useRequest';
import MyImage from '@fastgpt/web/components/common/Image/MyImage';
interface Props {
  setPageType: Dispatch<`${LoginPageTypeEnum}`>;
  loginSuccess: (e: ResLogin) => void;
}

interface LoginFormType {
  username: string;
  password: string;
}

const LoginForm = ({ setPageType, loginSuccess }: Props) => {
  const { t } = useTranslation();
  const { toast } = useToast();
  const { feConfigs } = useSystemStore();
  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm<LoginFormType>();

  const { runAsync: onclickLogin, loading: requesting } = useRequest2(
    async ({ username, password }: LoginFormType) => {
      const { code } = await getPreLogin(username);
      loginSuccess(
        await postLogin({
          username,
          password,
          code
        })
      );
      toast({
        title: t('login:login_success'),
        status: 'success'
      });
    },
    {
      refreshDeps: [loginSuccess]
    }
  );

  const isCommunityVersion = !!(feConfigs?.register_method && !feConfigs?.isPlus);

  const placeholder = (() => {
    if (isCommunityVersion) {
      return t('login:use_root_login');
    }
    return [t('common:support.user.login.Username')]
      .concat(
        feConfigs?.login_method?.map((item) => {
          switch (item) {
            case 'email':
              return t('common:support.user.login.Email');
            case 'phone':
              return t('common:support.user.login.Phone number');
          }
        }) ?? []
      )
      .join('/');
  })();

  return (
    <FormLayout setPageType={setPageType} pageType={LoginPageTypeEnum.passwordLogin}>
      <Box
        mt={9}
        onKeyDown={(e) => {
          if (e.key === 'Enter' && !e.shiftKey && !requesting) {
            handleSubmit(onclickLogin)();
          }
        }}
      >
        <FormControl isInvalid={!!errors.username} position="relative">
          <Flex position="absolute" left="16px" top="0" zIndex={4} h="46px" alignItems="center">
            <MyImage
              src="/icon/login/username-icon.svg"
              w={['20px', '20px']}
              h={['24px', '24px']}
            ></MyImage>
            <Box w="2px" h="16px" bg="rgba(51, 112, 255, .2)" ml="10px"></Box>
          </Flex>
          <Input
            bg={'#E9F1F9'}
            borderRadius={'10px'}
            pl="66px"
            fontSize="15px"
            color="#000"
            size={'lg'}
            h={[10, '46px']}
            placeholder={placeholder}
            {...register('username', {
              required: true
            })}
            _placeholder={{
              color: 'rgba(0,0,0,0.6)',
              fontSize: '15px'
            }}
          ></Input>
        </FormControl>
        <FormControl mt="20px" isInvalid={!!errors.password} position="relative">
          <Flex position="absolute" left="16px" top="0" zIndex={4} h="46px" alignItems="center">
            <MyImage
              src="/icon/login/password-icon.svg"
              w={['20px', '20px']}
              h={['26px', '26px']}
            ></MyImage>
            <Box w="2px" h="16px" bg="rgba(51, 112, 255, .2)" ml="10px"></Box>
          </Flex>
          <Input
            bg={'#E9F1F9'}
            borderRadius={'10px'}
            pl="66px"
            fontSize="15px"
            color="#000"
            size={'lg'}
            type={'password'}
            h={[10, '46px']}
            placeholder={
              isCommunityVersion
                ? t('login:root_password_placeholder')
                : t('common:support.user.login.Password')
            }
            _placeholder={{
              color: 'rgba(0,0,0,0.6)',
              fontSize: '15px'
            }}
            {...register('password', {
              required: true,
              maxLength: {
                value: 60,
                message: t('login:password_condition')
              }
            })}
          ></Input>
        </FormControl>
        {feConfigs?.docUrl && (
          <Flex
            alignItems={'center'}
            mt={7}
            fontSize={'mini'}
            color={'myGray.700'}
            fontWeight={'medium'}
          >
            {t('login:policy_tip')}
            <Link
              ml={1}
              href={getDocPath('/docs/agreement/terms/')}
              target={'_blank'}
              color={'primary.700'}
            >
              {t('login:terms')}
            </Link>
            <Box mx={1}>&</Box>
            <Link
              href={getDocPath('/docs/agreement/privacy/')}
              target={'_blank'}
              color={'primary.700'}
            >
              {t('login:privacy')}
            </Link>
          </Flex>
        )}

        <Button
          type="submit"
          mt="80px"
          w={'100%'}
          size={['md', 'md']}
          h={[10, '46px']}
          borderRadius={['0', '10px']}
          fontWeight={['500', '500']}
          fontSize={['20px', '20px']}
          colorScheme="#3370FF"
          isLoading={requesting}
          onClick={handleSubmit(onclickLogin)}
        >
          {t('login:Login')}
        </Button>

        <Flex
          align={'center'}
          justifyContent={'flex-end'}
          color={'primary.700'}
          fontWeight={'medium'}
        >
          {feConfigs?.find_password_method && feConfigs.find_password_method.length > 0 && (
            <Box
              cursor={'pointer'}
              _hover={{ textDecoration: 'underline' }}
              onClick={() => setPageType('forgetPassword')}
              fontSize="mini"
            >
              {t('login:forget_password')}
            </Box>
          )}
          {feConfigs?.register_method && feConfigs.register_method.length > 0 && (
            <Flex alignItems={'center'}>
              <Box mx={3} h={'12px'} w={'1px'} bg={'myGray.250'}></Box>
              <Box
                cursor={'pointer'}
                _hover={{ textDecoration: 'underline' }}
                onClick={() => setPageType('register')}
                fontSize="mini"
              >
                {t('login:register')}
              </Box>
            </Flex>
          )}
        </Flex>
      </Box>
    </FormLayout>
  );
};

export default LoginForm;
